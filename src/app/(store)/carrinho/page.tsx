"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { createClient, User } from "@supabase/supabase-js";
import {
  getCartCount,
  readCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  CartItem,
  setCurrentCartUserId,
} from "@/lib/cart";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function CartPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12">Carregando carrinho...</div>}>
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    const sync = () => setItems(readCartItems());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("rg-cart:update", sync);

    supabase.auth.getSession().then(({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      setCurrentCartUserId(nextUser?.id ?? null);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setCurrentCartUserId(nextUser?.id ?? null);
      setLoadingAuth(false);
    });

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rg-cart:update", sync);
      subscription.unsubscribe();
    };
  }, []);

  // Buscar estoque dos produtos no carrinho
  useEffect(() => {
    if (items.length === 0) {
      setProductStocks({});
      return;
    }

    const fetchStocks = async () => {
      try {
        const ids = items.map(i => i.productId).join(",");
        const response = await fetch(`/api/products?ids=${ids}`);
        if (response.ok) {
          const products = await response.json();
          const stocks: Record<string, number> = {};
          products.forEach((product: any) => {
            stocks[product.id] = product.stock;
          });
          setProductStocks(stocks);
        }
      } catch (error) {
        console.error("Erro ao buscar estoque:", error);
      }
    };

    fetchStocks();
  }, [items.length]);;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleQuantityChange(productId: string, currentQty: number, delta: number) {
    const nextQty = currentQty + delta;
    const maxStock = productStocks[productId] ?? 0;

    if (nextQty > maxStock) {
      alert(`Desculpe, você não pode adicionar mais que ${maxStock} ${maxStock === 1 ? 'unidade' : 'unidades'} deste produto.`);
      return;
    }

    if (nextQty < 0) return;

    updateCartItemQuantity(productId, nextQty);
  }

  function handleRemove(productId: string) {
    removeCartItem(productId);
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
        Sua seleção
      </p>
      <h1 className="text-4xl font-light mb-8">
        Carrinho {count > 0 && <span className="text-2xl text-zinc-500 font-normal">({count} {count === 1 ? "peça" : "peças"})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-medium text-zinc-800">Seu carrinho está vazio</h2>
          <p className="text-zinc-500 text-sm">
            Navegue por nossas coleções e escolha as peças perfeitas para você.
          </p>
          <Link
            href="/buscar"
            className="inline-flex bg-zinc-900 text-white px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Explorar peças
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Lista de itens do carrinho */}
          <div className="space-y-4">
            <div className="hidden sm:grid grid-cols-[80px_1fr_120px_110px_40px] gap-4 pb-2 border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>Item</span>
              <span>Descrição</span>
              <span className="text-center">Quantidade</span>
              <span className="text-right">Subtotal</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:grid sm:grid-cols-[80px_1fr_120px_110px_40px] gap-4 items-center"
              >
                {/* Miniatura da foto */}
                <div className="w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 text-center p-1">
                      Sem foto
                    </div>
                  )}
                </div>

                {/* Dados da peça */}
                <div className="w-full sm:w-auto space-y-1">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="font-medium text-zinc-900 hover:text-rose-500 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    R$ {Number(item.price).toFixed(2).replace(".", ",")} cada
                  </p>
                </div>

                {/* Controles de quantidade */}
                <div className="flex items-center justify-center border border-zinc-300 rounded-lg p-1 w-28">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity, -1)
                    }
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 disabled:opacity-30"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity, 1)
                    }
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal do item */}
                <div className="text-right w-full sm:w-auto font-semibold text-zinc-900">
                  R${" "}
                  {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </div>

                {/* Botão de exclusão */}
                <div className="text-right sm:text-center w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    title="Remover peça"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-3">
              <Link
                href="/buscar"
                className="text-sm text-zinc-600 hover:text-rose-500 transition-colors underline"
              >
                ← Continuar comprando
              </Link>
              <button
                onClick={() => clearCart()}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          {/* Resumo do Pedido e Ação de Compra */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-6 sticky top-24">
            <h2 className="text-lg font-medium text-zinc-900 pb-3 border-b border-zinc-200">
              Resumo da compra
            </h2>

            <div className="space-y-2 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal ({count} itens)</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-emerald-700 font-medium">A combinar</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-200 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Verificação de Autenticação */}
            {!loadingAuth && (
              <>
                {!user ? (
                  <div className="space-y-3 pt-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs leading-relaxed">
                      Para concluir a sua compra, é necessário estar cadastrado e logado. Seus itens salvos serão mantidos.
                    </div>

                    <Link
                      href="/cadastro?next=/carrinho"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors text-sm text-center"
                    >
                      <span>Cadastre-se para Concluir</span>
                      <ArrowRight size={16} />
                    </Link>

                    <p className="text-center text-xs text-zinc-500">
                      Já possui conta?{" "}
                      <Link
                        href="/login?next=/carrinho"
                        className="text-rose-500 underline font-medium"
                      >
                        Entrar
                      </Link>
                    </p>
                  </div>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors text-sm text-center"
                  >
                    <span>Prosseguir para Checkout</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
