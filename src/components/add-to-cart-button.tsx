"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartItem, readCartItems } from "@/lib/cart";

type AddToCartButtonProps = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  stock,
  image,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  if (stock <= 0) {
    return (
      <div className="mt-8">
        <button
          disabled
          className="w-full cursor-not-allowed justify-center rounded-md border border-zinc-200 bg-zinc-100 py-3.5 text-center text-sm font-medium text-zinc-400"
        >
          Produto indisponível
        </button>
      </div>
    );
  }

  function handleAddToCart() {
    const cartItems = readCartItems();
    const currentItem = cartItems.find(item => item.productId === productId);
    const currentQuantity = currentItem?.quantity ?? 0;

    if (currentQuantity >= stock) {
      alert(`Desculpe, você já tem ${stock} ${stock === 1 ? 'unidade' : 'unidades'} deste produto (máximo disponível).`);
      return;
    }

    addCartItem({ productId, slug, name, price, quantity: 1, image });
  }

  function handleBuyNow() {
    const cartItems = readCartItems();
    const currentItem = cartItems.find(item => item.productId === productId);
    const currentQuantity = currentItem?.quantity ?? 0;

    if (currentQuantity >= stock) {
      alert(`Desculpe, você já tem ${stock} ${stock === 1 ? 'unidade' : 'unidades'} deste produto (máximo disponível).`);
      return;
    }

    setIsAdding(true);
    addCartItem({ productId, slug, name, price, quantity: 1, image });
    router.push("/carrinho");
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="inline-flex justify-center bg-zinc-900 text-white px-6 py-3 rounded-md hover:bg-zinc-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Adicionar ao carrinho
      </button>
      <button
        onClick={handleBuyNow}
        disabled={isAdding}
        className="inline-flex justify-center border border-zinc-300 bg-white text-zinc-900 px-6 py-3 rounded-md hover:border-zinc-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Concluir compra
      </button>
    </div>
  );
}
