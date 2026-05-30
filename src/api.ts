/**
 * Typed client for the Ghost/Stripe integration endpoints.
 *
 *   GET  /api/config           -> { publishableKey }
 *   GET  /api/products         -> { products: ApiProduct[] }
 *   POST /api/sessions/create  -> { clientSecret }
 *   GET  /api/coupons/:code    -> coupon details
 */
const ENV_BASE = import.meta.env.VITE_API_BASE as string | undefined;

/** Base URL prepended to every API call. Empty = same-origin relative paths. */
export const API_BASE = (ENV_BASE ?? '').replace(/\/$/, '');

export type StripePlan = 'full' | 'installment';

export interface ConfigResponse {
  publishableKey: string;
}

export interface ApiPrice {
  id: string;
  unitAmount?: number | null;
  unit_amount?: number | null;
  currency?: string;
  recurring?: { interval?: string; interval_count?: number } | null;
  metadata?: Record<string, string>;
  nickname?: string | null;
  planSlot?: string | null;
  formatted?: string | null;
  type?: string | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  description?: string | null;
  prices: ApiPrice[];
  metadata?: Record<string, string>;
}

export interface ProductsResponse {
  products: ApiProduct[];
}

export interface CreateSessionPayload {
  productId: string;
  /**
   * The Stripe price id to charge (e.g. "price_1Tckj9..."). The backend's
   * /api/sessions/create resolves the session by this value, so it must be a
   * real price id from /api/products — NOT a keyword like "full".
   */
  plan: string;
  email: string;
  firstName: string;
  lastName: string;
  promotionCode?: string;
}

export interface CreateSessionResponse {
  clientSecret: string;
}

export interface CouponResponse {
  id: string;
  valid?: boolean;
  name?: string | null;
  percentOff?: number | null;
  percent_off?: number | null;
  amountOff?: number | null;
  amount_off?: number | null;
  currency?: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  getConfig: () => request<ConfigResponse>('/api/config'),
  getProducts: () => request<ProductsResponse>('/api/products'),
  createSession: (payload: CreateSessionPayload) =>
    request<CreateSessionResponse>('/api/sessions/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCoupon: (code: string) =>
    request<CouponResponse>(`/api/coupons/${encodeURIComponent(code)}`),
};
