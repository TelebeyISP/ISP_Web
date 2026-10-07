import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  deleteWishlistItem,
  fetchWishlist,
  getMedusaCustomerToken,
  onMedusaSession,
  saveWishlistItem,
  type MedusaWishlistItem,
} from '@/lib/medusa';

export interface WishlistItem {
  id: string;
  productId?: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  image?: string;
}

interface WishlistContextValue {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const LOCAL_KEY = 'medusa_wishlist';

function readLocal(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: WishlistItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const local = readLocal();
    if (!getMedusaCustomerToken()) {
      setWishlist(local);
      setIsLoading(false);
      return;
    }

    try {
      let remote = await fetchWishlist();
      const missing = local.filter((item) => !remote.some((saved) => saved.id === item.id));
      for (const item of missing) {
        remote = await saveWishlistItem(item as MedusaWishlistItem);
      }
      writeLocal(remote);
      setWishlist(remote);
    } catch (error) {
      console.warn('Medusa wishlist unavailable, using this browser.', error);
      setWishlist(local);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return onMedusaSession(() => {
      refresh();
    });
  }, [refresh]);

  const addToWishlist = async (item: WishlistItem) => {
    const local = readLocal();
    const next = local.some((entry) => entry.id === item.id) ? local : [...local, item];
    writeLocal(next);
    setWishlist(next);

    if (!getMedusaCustomerToken()) return;
    try {
      const remote = await saveWishlistItem(item);
      writeLocal(remote);
      setWishlist(remote);
    } catch (error) {
      console.warn('Could not save wishlist item on Medusa', error);
    }
  };

  const removeFromWishlist = async (id: string) => {
    const next = readLocal().filter((item) => item.id !== id);
    writeLocal(next);
    setWishlist(next);

    if (!getMedusaCustomerToken()) return;
    try {
      const remote = await deleteWishlistItem(id);
      writeLocal(remote);
      setWishlist(remote);
    } catch (error) {
      console.warn('Could not remove wishlist item on Medusa', error);
    }
  };

  const isInWishlist = (id: string) => wishlist.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, isLoading, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
