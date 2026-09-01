"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

function CardPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    installments: "1",
  });

  useEffect(() => {
    if (!orderId) {
      router.push("/carrinho");
      return;
    }

    // Buscar dados do pedido
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Em produção, integrar com PagSeguro
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Carregando...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-medium mb-2">Pedido não encontrado</h1>
        <Link href="/carrinho" className="text-rose-600 hover:text-rose-700">
          Voltar ao carrinho
        </Link>
      </div>
    );
  }

  const installmentAmount = Number(order.total) / parseInt(formData.installments);

  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
        Pagamento com Cartão
      </p>
      <h1 className="text-4xl font-light mb-8">Dados do Cartão</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resumo */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Valor total</p>
          <p className="text-2xl font-semibold text-zinc-900">
            R$ {Number(order.total).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-zinc-500 mt-3">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Número do cartão */}
        <div>
          <label className="block text-sm font-medium mb-2">Número do Cartão</label>
          <input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={formData.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 16);
              const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
              setFormData((prev) => ({ ...prev, cardNumber: formatted }));
            }}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
            required
          />
        </div>

        {/* Nome do titular */}
        <div>
          <label className="block text-sm font-medium mb-2">Nome do Titular</label>
          <input
            type="text"
            placeholder="Nome como aparece no cartão"
            value={formData.cardHolder}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cardHolder: e.target.value }))
            }
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
            required
          />
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Mês</label>
            <input
              type="text"
              placeholder="MM"
              maxLength={2}
              value={formData.expiryMonth}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiryMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ano</label>
            <input
              type="text"
              placeholder="AA"
              maxLength={2}
              value={formData.expiryYear}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiryYear: e.target.value.replace(/\D/g, "").slice(0, 2),
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <input
              type="text"
              placeholder="000"
              maxLength={3}
              value={formData.cvv}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
              required
            />
          </div>
        </div>

        {/* Parcelamento */}
        <div>
          <label className="block text-sm font-medium mb-2">Parcelamento</label>
          <select
            value={formData.installments}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, installments: e.target.value }))
            }
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500"
          >
            {[1, 2, 3, 4, 6, 12].map((i) => (
              <option key={i} value={i}>
                {i}x de R$ {installmentAmount.toFixed(2).replace(".", ",")}
              </option>
            ))}
          </select>
        </div>

        {/* Botão submit */}
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar Pagamento"
          )}
        </button>

        <Link
          href="/carrinho"
          className="block text-center text-zinc-600 hover:text-zinc-900 text-sm"
        >
          Voltar ao carrinho
        </Link>
      </form>

      {/* Nota importante */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        <p className="font-medium mb-1">⚠ Nota importante:</p>
        <p>Este é um ambiente de demonstração. Em produção, a integração real com PagSeguro processará o pagamento de forma segura.</p>
      </div>
    </div>
  );
}

export default function CardPaymentPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Suspense fallback={<div>Carregando...</div>}>
        <CardPaymentForm />
      </Suspense>
    </main>
  );
}
