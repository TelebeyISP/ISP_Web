import axios from "axios";

const TOKEN_KEY = "medusa_customer_token";
const CART_KEY = "medusa_cart_id";

export const MEDUSA_BASE_URL =
  import.meta.env.VITE_MEDUSA_URL?.replace(/\/$/, "") || "/medusa";

export const medusa = axios.create({
  baseURL: MEDUSA_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

medusa.interceptors.request.use((config) => {
  const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;
  if (publishableKey) {
    config.headers["x-publishable-api-key"] = publishableKey;
  }
  const customerToken = getMedusaCustomerToken();
  if (customerToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }
  return config;
});

export function getMedusaCustomerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

const sessionListeners = new Set<() => void>();

export function onMedusaSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function notifyMedusaSession() {
  sessionListeners.forEach((listener) => listener());
}

export function setMedusaCustomerToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyMedusaSession();
}

export function clearMedusaSession() {
  localStorage.removeItem(TOKEN_KEY);
  notifyMedusaSession();
}

export function getStoredCartId(): string | null {
  return localStorage.getItem(CART_KEY);
}

export function setStoredCartId(id: string) {
  localStorage.setItem(CART_KEY, id);
}

export type MedusaRegion = {
  id: string;
  name: string;
  currency_code: string;
};

export type MedusaProduct = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  handle: string;
  categories?: { id: string; name: string }[] | null;
  images?: { url: string }[] | null;
  variants?: {
    id: string;
    title?: string | null;
    calculated_price?: {
      calculated_amount?: number | null;
      currency_code?: string | null;
    } | null;
  }[] | null;
};

type MedusaCartItem = {
  id: string;
  title?: string | null;
  product_title?: string | null;
  variant_title?: string | null;
  variant_id?: string | null;
  quantity: number;
  unit_price?: number | null;
  thumbnail?: string | null;
};

export type MedusaCart = {
  id: string;
  currency_code?: string | null;
  email?: string | null;
  items?: MedusaCartItem[] | null;
  total?: number | null;
  item_total?: number | null;
};

export async function listRegions(): Promise<MedusaRegion[]> {
  const { data } = await medusa.get<{ regions: MedusaRegion[] }>("/store/regions");
  return data.regions ?? [];
}

export function preferredRegion(regions: MedusaRegion[]): MedusaRegion | undefined {
  return (
    regions.find((region) => region.currency_code === "usd") ||
    regions.find((region) => region.name.toLowerCase().includes("united states")) ||
    regions[0]
  );
}

export type MedusaSearchHit = {
  id: string;
  title: string;
  handle?: string;
  thumbnail?: string | null;
};

export async function searchProducts(term: string): Promise<MedusaSearchHit[]> {
  const { data } = await medusa.post<{
    results: { hits: { id: string; document?: MedusaSearchHit }[] }[];
  }>("/store/search", {
    entity: "product",
    filters: { q: term },
    pagination: { take: 6 },
    fields: ["id", "title", "handle", "thumbnail"],
  });
  return (data.results?.[0]?.hits ?? []).map((hit) => ({
    id: hit.document?.id || hit.id,
    title: hit.document?.title || "Product",
    handle: hit.document?.handle,
    thumbnail: hit.document?.thumbnail,
  }));
}

export type MedusaWishlistItem = {
  id: string;
  productId?: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  image?: string;
};

export async function fetchWishlist(): Promise<MedusaWishlistItem[]> {
  const { data } = await medusa.get<{ wishlist: MedusaWishlistItem[] }>("/store/wishlist");
  return data.wishlist ?? [];
}

export async function saveWishlistItem(item: MedusaWishlistItem): Promise<MedusaWishlistItem[]> {
  const { data } = await medusa.post<{ wishlist: MedusaWishlistItem[] }>("/store/wishlist", item);
  return data.wishlist ?? [];
}

export async function deleteWishlistItem(id: string): Promise<MedusaWishlistItem[]> {
  const { data } = await medusa.delete<{ wishlist: MedusaWishlistItem[] }>(
    `/store/wishlist/${encodeURIComponent(id)}`
  );
  return data.wishlist ?? [];
}

export async function listProducts(regionId?: string): Promise<MedusaProduct[]> {
  const { data } = await medusa.get<{ products: MedusaProduct[] }>("/store/products", {
    params: {
      limit: 100,
      region_id: regionId,
      fields: "*variants.calculated_price,*categories,*images",
    },
  });
  return data.products ?? [];
}

export async function createCart(regionId?: string): Promise<MedusaCart> {
  const { data } = await medusa.post<{ cart: MedusaCart }>("/store/carts", {
    region_id: regionId,
  });
  return data.cart;
}

export async function retrieveCart(cartId: string): Promise<MedusaCart> {
  const { data } = await medusa.get<{ cart: MedusaCart }>(`/store/carts/${cartId}`);
  return data.cart;
}

export async function addLineItem(cartId: string, variantId: string, quantity: number) {
  const { data } = await medusa.post<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items`,
    { variant_id: variantId, quantity }
  );
  return data.cart;
}

export async function updateLineItem(cartId: string, lineId: string, quantity: number) {
  const { data } = await medusa.post<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineId}`,
    { quantity }
  );
  return data.cart;
}

export async function removeLineItem(cartId: string, lineId: string) {
  const { data } = await medusa.delete<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineId}`
  );
  return data.cart;
}

/**
 * Turn an ISP session into a Medusa customer and attach the open cart.
 * Uses the same ApiGate access token the rest of the site already stores.
 */
async function requestIspToken(accessToken: string) {
  const login = await axios.post<{ token?: string }>(
    `${MEDUSA_BASE_URL}/auth/customer/isp`,
    { access_token: accessToken },
    {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "",
      },
    }
  );
  if (!login.data.token) {
    throw new Error("Medusa did not return a customer token");
  }
  return login.data.token;
}

export async function syncIspCustomer(input: {
  accessToken: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  let token = await requestIspToken(input.accessToken);
  setMedusaCustomerToken(token);

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });
  try {
    await medusa.get("/store/customers/me", { headers: authHeaders() });
  } catch {
    await medusa.post(
      "/store/customers",
      {
        email: input.email,
        first_name: input.firstName || input.email.split("@")[0],
        last_name: input.lastName || "Customer",
      },
      { headers: authHeaders() }
    );
    // The first token has no customer id. Sign in again so later cart calls are authorized.
    token = await requestIspToken(input.accessToken);
    setMedusaCustomerToken(token);
  }

  const cartId = getStoredCartId();
  if (cartId) {
    try {
      const { data } = await medusa.post<{ cart: MedusaCart }>(
        `/store/carts/${cartId}/customer`,
        {},
        { headers: authHeaders }
      );
      return data.cart;
    } catch {
      // Cart may already belong to this customer.
    }
  }
  return null;
}
