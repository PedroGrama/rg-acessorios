export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CartStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const CART_KEY = "rg-acessorios-cart";
const CART_USER_KEY = "rg-acessorios-cart-user";

export function getCartStorageKey(userId?: string | null) {
  return `${CART_KEY}:${userId || "guest"}`;
}

export function getCurrentCartUserId(storage: CartStorage = globalThis.localStorage): string | null {
  if (!storage) return null;
  const userId = storage.getItem(CART_USER_KEY);
  return userId || null;
}

export function setCurrentCartUserId(userId: string | null, storage: CartStorage = globalThis.localStorage) {
  if (!storage) return;
  if (!userId) {
    storage.removeItem(CART_USER_KEY);
    return;
  }
  storage.setItem(CART_USER_KEY, userId);
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    if (digits.length <= 0) return "";
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, prefix, suffix) =>
      suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`,
    );
  }

  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, prefix, suffix) =>
    suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`,
  );
}

export function normalizePostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  if (digits.length < 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function readCartItems(storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)): CartItem[] {
  if (!storage) return [];
  const key = getCartStorageKey(userId);

  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.productId === "string") : [];
  } catch {
    return [];
  }
}

export function addCartItem(item: CartItem, storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)) {
  const key = getCartStorageKey(userId);
  const nextItems = readCartItems(storage, userId);
  const existing = nextItems.find((cartItem) => cartItem.productId === item.productId);
  const merged = existing
    ? nextItems.map((cartItem) => cartItem.productId === item.productId
      ? {
          ...cartItem,
          quantity: cartItem.quantity + Math.max(1, item.quantity),
          price: item.price,
          image: item.image ?? cartItem.image,
        }
      : cartItem)
    : [...nextItems, { ...item, quantity: Math.max(1, item.quantity) }];

  storage.setItem(key, JSON.stringify(merged));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
  return merged.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

export function updateCartItemQuantity(productId: string, quantity: number, storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)) {
  const key = getCartStorageKey(userId);
  const currentItems = readCartItems(storage, userId);
  const nextItems = quantity <= 0
    ? currentItems.filter((item) => item.productId !== productId)
    : currentItems.map((item) => item.productId === productId ? { ...item, quantity } : item);

  storage.setItem(key, JSON.stringify(nextItems));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
  return nextItems;
}

export function removeCartItem(productId: string, storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)) {
  return updateCartItemQuantity(productId, 0, storage, userId);
}

export function clearCart(storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)) {
  storage.removeItem(getCartStorageKey(userId));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
}

export function getCartCount(storage: CartStorage = globalThis.localStorage, userId = getCurrentCartUserId(storage)) {
  return readCartItems(storage, userId).reduce((total, item) => total + item.quantity, 0);
}

