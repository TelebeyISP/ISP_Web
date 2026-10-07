import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem } from '@/types/shop';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/apigate';
import {
  addLineItem,
  createCart,
  getStoredCartId,
  listRegions,
  preferredRegion,
  removeLineItem,
  retrieveCart,
  setStoredCartId,
  syncIspCustomer,
  updateLineItem,
  type MedusaCart,
} from '@/lib/medusa';

interface ShopContextValue {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (
    variantId: string,
    quantity: number,
    details?: Partial<Pick<CartItem, 'productName' | 'variantName' | 'unitPrice' | 'image'>>
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const ShopContext = createContext<ShopContextValue | null>(null);
const LOCAL_CART_KEY = 'local_mock_cart';
const EXTRA_KEY = 'medusa_extra_items';

function readExtras(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_KEY) || '[]') as CartItem[];
  } catch {
    return [];
  }
}

function writeExtras(items: CartItem[]) {
  localStorage.setItem(EXTRA_KEY, JSON.stringify(items));
}

function moneyToCents(amount: number | null | undefined): number {
  if (amount == null || Number.isNaN(amount)) return 0;
  // Medusa store prices are major currency units (15 = $15.00).
  return Math.round(amount * 100);
}

function mapCart(cart: MedusaCart): Cart {
  const items: CartItem[] = (cart.items ?? []).map((item) => ({
    id: item.id,
    variantId: item.variant_id || undefined,
    productName: item.product_title || item.title || 'Item',
    variantName: item.variant_title || item.title || '',
    unitPrice: moneyToCents(item.unit_price),
    total: moneyToCents((item.unit_price ?? 0) * item.quantity),
    quantity: item.quantity,
    image: item.thumbnail || undefined,
  }));
  const extras = readExtras();
  const allItems = [...items, ...extras];
  const merchandise = moneyToCents(cart.total ?? cart.item_total ?? 0) ||
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const extraTotal = extras.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    tokenValue: cart.id,
    items: allItems,
    itemsTotal: allItems.reduce((sum, item) => sum + item.quantity, 0),
    total: merchandise + extraTotal,
    currencyCode: (cart.currency_code || 'usd').toUpperCase(),
  };
}

function emptyLocalCart(): Cart {
  return {
    tokenValue: `local_cart_${Date.now()}`,
    items: [],
    itemsTotal: 0,
    total: 0,
    currencyCode: 'USD',
    isLocal: true,
  };
}

function persistLocal(cart: Cart) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regionId, setRegionId] = useState<string | undefined>();

  const applyMedusaCart = useCallback((next: MedusaCart) => {
    setStoredCartId(next.id);
    const mapped = mapCart(next);
    setCart(mapped);
    return mapped;
  }, []);

  const createRemoteCart = useCallback(async (region?: string) => {
    const created = await createCart(region);
    return applyMedusaCart(created);
  }, [applyMedusaCart]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const regions = await listRegions();
        const region = preferredRegion(regions);
        if (cancelled) return;
        setRegionId(region?.id);

        const storedId = getStoredCartId();
        if (storedId) {
          try {
            const existing = await retrieveCart(storedId);
            if (!cancelled) applyMedusaCart(existing);
            return;
          } catch {
            localStorage.removeItem('medusa_cart_id');
          }
        }
        if (!cancelled) await createRemoteCart(region?.id);
      } catch (err) {
        console.warn('Medusa is offline. Using a local cart.', err);
        if (cancelled) return;
        const saved = localStorage.getItem(LOCAL_CART_KEY);
        if (saved) {
          setCart(JSON.parse(saved) as Cart);
        } else {
          const local = emptyLocalCart();
          persistLocal(local);
          setCart(local);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [applyMedusaCart, createRemoteCart]);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!user || !accessToken || user.walletAddress || !user.email || cart?.isLocal) {
      return;
    }

    let cancelled = false;
    syncIspCustomer({
      accessToken,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    })
      .then((linked) => {
        if (!cancelled && linked) applyMedusaCart(linked);
      })
      .catch((err) => {
        console.warn('Could not link the ISP account to the shop', err);
      });

    return () => {
      cancelled = true;
    };
  }, [user, cart?.isLocal, cart?.tokenValue, applyMedusaCart]);

  const addToCart = async (
    variantId: string,
    quantity: number,
    details?: Partial<Pick<CartItem, 'productName' | 'variantName' | 'unitPrice' | 'image'>>
  ) => {
    if (!cart) return;

    if (cart.isLocal) {
      const unitPrice = details?.unitPrice ?? 0;
      const item: CartItem = {
        id: `${variantId}-${Date.now()}`,
        variantId,
        productName: details?.productName || variantId,
        variantName: details?.variantName || 'Standard',
        unitPrice,
        total: unitPrice * quantity,
        quantity,
        image: details?.image,
      };
      const items = [...cart.items, item];
      const updated: Cart = {
        ...cart,
        items,
        itemsTotal: items.reduce((sum, entry) => sum + entry.quantity, 0),
        total: items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
      };
      persistLocal(updated);
      setCart(updated);
      return;
    }

    const isMedusaVariant = variantId.startsWith('variant_');
    if (!isMedusaVariant) {
      const unitPrice = details?.unitPrice ?? 0;
      const extras = readExtras();
      extras.push({
        id: `extra_${variantId}_${Date.now()}`,
        variantId,
        productName: details?.productName || variantId,
        variantName: details?.variantName || 'Standard',
        unitPrice,
        total: unitPrice * quantity,
        quantity,
        image: details?.image,
      });
      writeExtras(extras);
      const currentId = getStoredCartId();
      if (currentId) {
        applyMedusaCart(await retrieveCart(currentId));
      }
      return;
    }

    try {
      const next = await addLineItem(cart.tokenValue, variantId, quantity);
      applyMedusaCart(next);
    } catch (err) {
      console.error('Failed to add to Medusa cart', err);
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cart) return;
    const extras = readExtras();
    if (extras.some((item) => item.id === itemId)) {
      writeExtras(extras.filter((item) => item.id !== itemId));
      const currentId = getStoredCartId();
      if (currentId) applyMedusaCart(await retrieveCart(currentId));
      return;
    }
    if (cart.isLocal) {
      const items = cart.items.filter((item) => item.id !== itemId);
      const updated: Cart = {
        ...cart,
        items,
        itemsTotal: items.reduce((sum, entry) => sum + entry.quantity, 0),
        total: items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
      };
      persistLocal(updated);
      setCart(updated);
      return;
    }
    const next = await removeLineItem(cart.tokenValue, itemId);
    applyMedusaCart(next);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    const extras = readExtras();
    if (extras.some((item) => item.id === itemId)) {
      writeExtras(extras.map((item) =>
        item.id === itemId ? { ...item, quantity, total: item.unitPrice * quantity } : item
      ));
      const currentId = getStoredCartId();
      if (currentId) applyMedusaCart(await retrieveCart(currentId));
      return;
    }
    if (cart.isLocal) {
      const items = cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity, total: item.unitPrice * quantity } : item
      );
      const updated: Cart = {
        ...cart,
        items,
        itemsTotal: items.reduce((sum, entry) => sum + entry.quantity, 0),
        total: items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
      };
      persistLocal(updated);
      setCart(updated);
      return;
    }
    const next = await updateLineItem(cart.tokenValue, itemId, quantity);
    applyMedusaCart(next);
  };

  const clearCart = async () => {
    localStorage.removeItem('medusa_cart_id');
    writeExtras([]);
    try {
      await createRemoteCart(regionId);
    } catch {
      const local = emptyLocalCart();
      persistLocal(local);
      setCart(local);
    }
  };

  return (
    <ShopContext.Provider value={{ cart, isLoading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </ShopContext.Provider>
  );
}

export { ShopContext };
