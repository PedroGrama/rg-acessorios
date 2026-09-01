"use client";

import { useEffect, useState } from "react";
import { getCartCount, readCartItems } from "@/lib/cart";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartCount());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("rg-cart:update", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rg-cart:update", sync);
    };
  }, []);

  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none">
      {count}
    </span>
  );
}
