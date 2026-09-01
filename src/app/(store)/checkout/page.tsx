"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { readCartItems, CartItem } from "@/lib/cart";
import { ArrowLeft, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12">Carregando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    postalCode: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: "",
  });
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | "debit">("pix");

  useEffect(() => {
    const sync = () => setItems(readCartItems());
    sync();

    supabase.auth.getSession().then(({ data }) => {
      const userData = data.session?.user;
      if (!userData) {
        router.push("/login?next=/checkout");
        return;
      }
      setUser(userData);
      setShippingData((prev) => ({
        ...prev,
        email: userData.email || "",
        fullName: userData.user_metadata?.name || "",
      }));
      setLoading(false);
    });
  }, [router]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + shippingCost;

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    setShippingData((prev) => ({ ...prev, postalCode: cep }));

    if (cep.length === 8) {
      try {
        // Buscar CEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setShippingData((prev) => ({
              ...prev,
              address: data.logradouro,
              city: data.localidade,
              state: data.uf,
            }));

            // Calcular frete
            const shippingRes = await fetch("/api/shipping/calculate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                postalCode: cep,
                items: items.map((item) => ({
                  quantity: item.quantity,
                  weight: 0.1,
                  length: 15,
                  width: 11,
                  height: 6,
                })),
              }),
            });

            if (shippingRes.ok) {
              const shipping = await shippingRes.json();
              setShippingOptions(shipping.options || []);
              if (shipping.options?.length > 0) {
                setSelectedShipping(shipping.options[0].id);
                setShippingCost(Number(shipping.options[0].price) || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleShippingSelection = (option: any) => {
    setSelectedShipping(option.id);
    setShippingCost(Number(option.price) || 0);
  };

  const handlePayment = async () => {
    // Validação dos dados obrigatórios
    if (!shippingData.fullName.trim()) {
      alert("Por favor, informe o nome completo");
      return;
    }
    if (!shippingData.phone.trim()) {
      alert("Por favor, informe o telefone");
      return;
    }
    if (!shippingData.postalCode.trim() || shippingData.postalCode.length !== 8) {
      alert("Por favor, informe um CEP válido");
      return;
    }
    if (!shippingData.number.trim()) {
      alert("Por favor, informe o número da residência");
      return;
    }
    if (!selectedShipping) {
      alert("Selecione uma opção de frete");
      return;
    }

    setProcessingPayment(true);
    try {
      // Criar pedido
      const orderRes = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          customerName: shippingData.fullName,
          customerEmail: shippingData.email,
          customerPhone: shippingData.phone,
          shippingAddress: {
            address: shippingData.address,
            number: shippingData.number,
            complement: shippingData.complement,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.postalCode,
          },
          shippingCost,
          shippingMethod: selectedShipping,
          items,
          paymentMethod,
          total: finalTotal,
        }),
      });

      if (orderRes.ok) {
        const order = await orderRes.json();

        // Limpar carrinho
        if (typeof window !== "undefined") {
          localStorage.removeItem("rg-acessorios-cart");
          window.dispatchEvent(new CustomEvent("rg-cart:update"));
        }

        // Redirecionar para pagamento
        if (paymentMethod === "pix") {
          // Implementar pagamento PIX via PagSeguro
          router.push(`/pix-payment?orderId=${order.id}`);
        } else {
          // Implementar pagamento com cartão
          router.push(`/card-payment?orderId=${order.id}`);
        }
      } else {
        const error = await orderRes.json();
        alert(error.error || "Erro ao criar pedido");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Carregando...</div>;
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">Checkout</p>
        <h1 className="text-4xl font-light mb-8">Seu carrinho está vazio</h1>
        <Link href="/buscar" className="text-rose-600 hover:text-rose-700">
          ← Continuar comprando
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-600 hover:text-zinc-900">
          <ArrowLeft size={20} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">Checkout</p>
      </div>

      <h1 className="text-4xl font-light mb-12">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Formulário */}
        <div className="space-y-8">
          {step === "shipping" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium mb-4">Dados de Entrega</h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={shippingData.fullName}
                    onChange={(e) =>
                      setShippingData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="email"
                    placeholder="E-mail"
                    value={shippingData.email}
                    onChange={(e) =>
                      setShippingData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={shippingData.phone}
                    onChange={(e) =>
                      setShippingData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="text"
                    placeholder="CEP"
                    value={shippingData.postalCode}
                    onChange={handlePostalCodeChange}
                    maxLength={8}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />

                  {shippingData.address && (
                    <>
                      <input
                        type="text"
                        placeholder="Endereço"
                        value={shippingData.address}
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 cursor-not-allowed"
                        disabled
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Número"
                          value={shippingData.number}
                          onChange={(e) =>
                            setShippingData((prev) => ({ ...prev, number: e.target.value }))
                          }
                          className="px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                        />
                        <input
                          type="text"
                          placeholder="Complemento"
                          value={shippingData.complement}
                          onChange={(e) =>
                            setShippingData((prev) => ({
                              ...prev,
                              complement: e.target.value,
                            }))
                          }
                          className="px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Opções de Frete */}
              {shippingOptions.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium mb-4">Opções de Frete</h2>
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={() => handleShippingSelection(option)}
                          className="cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {option.name} ({option.delivery_time} dias)
                          </p>
                          <p className="text-sm text-zinc-500">
                            R$ {Number(option.price).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep("payment")}
                disabled={!selectedShipping}
                className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ir para Pagamento
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Método de Pagamento</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-rose-500 rounded-lg cursor-pointer bg-rose-50">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === "pix"}
                    onChange={(e) => setPaymentMethod("pix")}
                    className="cursor-pointer"
                  />
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-zinc-600">Menor taxa • Pagamento instantâneo</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-zinc-200 rounded-lg cursor-pointer hover:border-rose-500">
                  <input
                    type="radio"
                    name="payment"
                    value="credit"
                    checked={paymentMethod === "credit"}
                    onChange={(e) => setPaymentMethod("credit")}
                    className="cursor-pointer"
                  />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-zinc-600">Parcelado em até 12x</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-zinc-200 rounded-lg cursor-pointer hover:border-rose-500">
                  <input
                    type="radio"
                    name="payment"
                    value="debit"
                    checked={paymentMethod === "debit"}
                    onChange={(e) => setPaymentMethod("debit")}
                    className="cursor-pointer"
                  />
                  <div>
                    <p className="font-medium">Débito em Conta</p>
                    <p className="text-sm text-zinc-600">Pagamento imediato</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("shipping")}
                  className="flex-1 border border-zinc-300 text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="flex-1 bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Pagamento"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sticky top-24 h-fit">
          <h2 className="text-lg font-medium mb-6 pb-4 border-b border-zinc-200">
            Resumo da Compra
          </h2>

          <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-zinc-600 line-clamp-1">{item.name} × {item.quantity}</span>
                <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-zinc-200 pt-4">
            <div className="flex justify-between">
              <span className="text-zinc-600">Subtotal</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Frete</span>
              <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t border-zinc-200">
              <span>Total</span>
              <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
