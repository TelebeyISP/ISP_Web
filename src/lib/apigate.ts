import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'telebey_auth_token';
const REFRESH_KEY = 'telebey_refresh_token';

/** Vite proxies `/apigate` to the NestJS ApiGate service (default port 4000). */
export const APIGATE_BASE_URL =
  import.meta.env.VITE_APIGATE_URL?.replace(/\/$/, '') || '/apigate';

export const apigate = axios.create({
  baseURL: APIGATE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

apigate.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function rotateRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const { data } = await axios.post<TokenPair>(
    `${APIGATE_BASE_URL}/auth/refresh`,
    { refresh_token: refreshToken },
    { withCredentials: true },
  );

  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

apigate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const requestUrl = original.url ?? '';
    if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshInFlight ??= rotateRefreshToken().finally(() => {
        refreshInFlight = null;
      });
      const nextToken = await refreshInFlight;
      if (!nextToken) {
        clearTokens();
        return Promise.reject(error);
      }
      original.headers.Authorization = `Bearer ${nextToken}`;
      return apigate(original);
    } catch {
      clearTokens();
      return Promise.reject(error);
    }
  },
);

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface ApiGateUser {
  id: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface AuthResponse extends TokenPair {
  user: ApiGateUser;
}

export interface ApiGatePlan {
  id: string;
  name: string;
  description: string | null;
  dataLimitMb: number;
  priceCents: number;
  validityDays: number;
  isActive: boolean;
}

export interface ApiGateSim {
  id: string;
  iccid: string;
  imsi: string | null;
  status: 'active' | 'blocked' | 'pending';
  dataUsedMb: number;
  plan?: ApiGatePlan | null;
}

export interface ApiGateHealth {
  status: string;
  timestamp: string;
}

export async function fetchApiGateHealth(): Promise<ApiGateHealth> {
  const { data } = await apigate.get<ApiGateHealth>('/health');
  return data;
}

export async function fetchPlans(): Promise<ApiGatePlan[]> {
  const { data } = await apigate.get<ApiGatePlan[]>('/plans');
  return data;
}

export async function fetchSims(): Promise<ApiGateSim[]> {
  const { data } = await apigate.get<ApiGateSim[]>('/sim');
  return data;
}

export async function activateSim(iccid: string, imsi: string): Promise<ApiGateSim> {
  const { data } = await apigate.post<ApiGateSim>('/sim/activate', { iccid, imsi });
  return data;
}
