import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  apigate,
  clearTokens,
  getAccessToken,
  setTokens,
  type ApiGateUser,
} from '@/lib/apigate';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  walletAddress?: string;
  walletName?: string;
  walletImage?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  username?: string;
  bio?: string;
  bannerImage?: string;
  role: UserRole;
  isPublic?: boolean;
  createdAt?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (address: string, name: string, image?: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
}

function mapApiGateUser(apiUser: ApiGateUser, extras: Partial<AuthUser> = {}): AuthUser {
  const isAdminFlag = apiUser.role === 'admin' || apiUser.email.endsWith('@telebey.com');
  return {
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone ?? null,
    role: isAdminFlag ? 'admin' : 'user',
    createdAt: apiUser.created_at,
    ...extras,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<AuthCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(getAccessToken());
  const pendingProfileRef = useRef<Partial<AuthUser> | null>(null);

  const mergeFirestoreProfile = useCallback(async (base: AuthUser) => {
    try {
      const firestoreSnap = await getDoc(doc(db, 'users', base.id));
      if (firestoreSnap.exists()) {
        return { ...base, ...firestoreSnap.data() } as AuthUser;
      }
    } catch (e) {
      console.warn('Firestore profile merge skipped', e);
    }
    return base;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apigate.post('/auth/logout');
    } catch {
      // Token may already be invalid; still clear local session.
    }
    tokenRef.current = null;
    clearTokens();
    localStorage.removeItem('telebey_wallet_user');
    localStorage.removeItem('telebey_profile');
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  // ── Fetch Profile from ApiGate ─────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const res = await apigate.get<{ user: { sub: string; email: string } }>('/auth/me');
    const payload = res.data.user;
    const cached = localStorage.getItem('telebey_profile');
    let extras: Partial<AuthUser> = {};
    if (cached) {
      try {
        extras = JSON.parse(cached) as Partial<AuthUser>;
      } catch {
        extras = {};
      }
    }

    const base = mapApiGateUser(
      {
        id: payload.sub,
        email: payload.email,
        role: payload.email.endsWith('@telebey.com') ? 'admin' : 'user',
      },
      extras,
    );
    const merged = await mergeFirestoreProfile(base);
    setUser(merged);
    localStorage.setItem('telebey_profile', JSON.stringify(merged));
  }, [mergeFirestoreProfile]);

  // Bootstrap on mount
  useEffect(() => {
    const walletUserStr = localStorage.getItem('telebey_wallet_user');
    if (walletUserStr) {
      try {
        const parsedWalletUser = JSON.parse(walletUserStr);
        setUser(parsedWalletUser);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse wallet user", e);
      }
    }

    if (tokenRef.current) {
      fetchProfile()
        .catch((err) => {
          console.error('Failed to fetch ApiGate profile', err);
          clearTokens();
          tokenRef.current = null;
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Sync user to Firestore and Heartbeat
  useEffect(() => {
    if (!user) return;

    // 1. Initial Sync
    const syncUser = async () => {
      try {
        await setDoc(doc(db, 'users', user.id), {
          ...user,
          usernameLowercase: user.username?.toLowerCase() || null,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Error syncing user to Firestore:", e);
      }
    };
    syncUser();

    // 2. Heartbeat every 2 minutes
    const interval = setInterval(async () => {
      try {
        await setDoc(doc(db, 'users', user.id), {
          lastSeen: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Heartbeat failed:", e);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [user]);

  // ── Login via ApiGate ──────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apigate.post('/auth/login', { email, password });
      const { access_token, refresh_token, user: apiUser } = res.data;

      tokenRef.current = access_token;
      setTokens(access_token, refresh_token);

      const mapped = mapApiGateUser(apiUser, pendingProfileRef.current ?? {});
      pendingProfileRef.current = null;
      const merged = await mergeFirestoreProfile(mapped);
      setUser(merged);
      localStorage.setItem('telebey_profile', JSON.stringify(merged));
      navigate('/account');
    } catch (err) {
      console.error('ApiGate login failed', err);
      throw err;
    }
  }, [mergeFirestoreProfile, navigate]);

  // ── Wallet Login ───────────────────────────────────────────────────────────
  const loginWithWallet = useCallback(async (address: string, name: string, image?: string) => {
    const walletUser: AuthUser = {
      id: address,
      email: `${address.substring(0, 6)}...${address.substring(address.length - 4)}@wallet.local`,
      walletAddress: address,
      walletName: name,
      walletImage: image,
      role: 'user',
      isPublic: true,
      createdAt: new Date().toISOString()
    };
    
    setUser(walletUser);
    localStorage.setItem('telebey_wallet_user', JSON.stringify(walletUser));
    clearTokens();
    tokenRef.current = null;
    
    navigate('/account');
  }, [navigate]);

  // ── Register via ApiGate, then sign in ─────────────────────────────────────
  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      pendingProfileRef.current = { firstName, lastName };
      await apigate.post('/auth/register', { email, password });
      await login(email, password);
    } catch (err) {
      pendingProfileRef.current = null;
      console.error('ApiGate registration failed', err);
      throw err;
    }
  }, [login]);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;

    const newUser = { ...user, ...updates };
    
    // Update State
    setUser(newUser);
    
    // Update LocalStorage (for bootstrap)
    if (newUser.walletAddress) {
      localStorage.setItem('telebey_wallet_user', JSON.stringify(newUser));
    } else {
      localStorage.setItem('telebey_profile', JSON.stringify(newUser));
    }
    
    // Sync to Firestore immediately
    try {
      await setDoc(doc(db, 'users', user.id), {
        ...newUser,
        usernameLowercase: newUser.username?.toLowerCase() || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error("Error updating user in Firestore:", e);
    }
  }, [user]);

  const isAdmin = user?.role === 'admin';

  return (
    <Ctx.Provider value={{ user, isAuthenticated: !!user, isAdmin, isLoading, login, loginWithWallet, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
