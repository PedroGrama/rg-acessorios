"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CartBadge } from "@/components/cart-badge";

export function CartLink() {
  return (
    <Link
      href="/carrinho"
      aria-label="Carrinho"
      className="flex items-center gap-2 hover:text-zinc-600 transition-colors text-sm font-medium"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="hidden md:inline">Carrinho</span>
      <CartBadge />
    </Link>
  );
}

