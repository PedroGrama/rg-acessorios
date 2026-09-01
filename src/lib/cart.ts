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

export function readCartItems(storage: CartStorage = globalThis.localStorage): CartItem[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.productId === "string") : [];
  } catch {
    return [];
  }
}

export function addCartItem(item: CartItem, storage: CartStorage = globalThis.localStorage) {
  const nextItems = readCartItems(storage);
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

  storage.setItem(CART_KEY, JSON.stringify(merged));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
  return merged.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

export function updateCartItemQuantity(productId: string, quantity: number, storage: CartStorage = globalThis.localStorage) {
  const currentItems = readCartItems(storage);
  const nextItems = quantity <= 0
    ? currentItems.filter((item) => item.productId !== productId)
    : currentItems.map((item) => item.productId === productId ? { ...item, quantity } : item);

  storage.setItem(CART_KEY, JSON.stringify(nextItems));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
  return nextItems;
}

export function removeCartItem(productId: string, storage: CartStorage = globalThis.localStorage) {
  return updateCartItemQuantity(productId, 0, storage);
}

export function clearCart(storage: CartStorage = globalThis.localStorage) {
  storage.removeItem(CART_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rg-cart:update"));
  }
}

export function getCartCount(storage: CartStorage = globalThis.localStorage) {
  return readCartItems(storage).reduce((total, item) => total + item.quantity, 0);
}

