"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Check, AlertCircle, Printer } from "lucide-react";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-medium mb-2">Pedido não encontrado</h1>
        <Link href="/" className="text-rose-600 hover:text-rose-700">
          Voltar à loja
        </Link>
      </div>
    );
  }

  const statusText = {
    PENDING: "Aguardando Pagamento",
    CONFIRMED: "Confirmado",
    PROCESSING: "Em Processamento",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };

  const statusColor = {
    PENDING: "text-amber-600",
    CONFIRMED: "text-blue-600",
    PROCESSING: "text-indigo-600",
    SHIPPED: "text-purple-600",
    DELIVERED: "text-emerald-600",
    CANCELLED: "text-red-600",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sucesso */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
          Pedido Confirmado
        </p>
        <h1 className="text-4xl font-light mb-2">Obrigado por sua compra!</h1>
        <p className="text-zinc-600">
          Você receberá um e-mail de confirmação em breve.
        </p>
      </div>

      {/* Detalhes do Pedido */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Número do Pedido
            </p>
            <p className="text-xl font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Data
            </p>
            <p className="text-xl font-semibold">
              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Status
            </p>
            <p className={`text-lg font-semibold ${statusColor[order.status as keyof typeof statusColor]}`}>
              {statusText[order.status as keyof typeof statusText]}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Total
            </p>
            <p className="text-xl font-semibold">
              R$ {Number(order.total).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        {/* Itens */}
        <div className="border-t border-zinc-200 pt-6">
          <h2 className="font-medium mb-4">Itens do Pedido</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-zinc-100"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-zinc-500">Quantidade: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  R$ {(Number(item.price) * item.quantity).toFixed(2).replace(".", ",")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div className="border-t border-zinc-200 pt-6 mt-6">
          <h2 className="font-medium mb-4">Endereço de Entrega</h2>
          <div className="p-4 bg-white rounded-lg border border-zinc-100">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-zinc-600 mt-1">
              {order.shippingAddress.address}, {order.shippingAddress.number}
            </p>
            {order.shippingAddress.complement && (
              <p className="text-sm text-zinc-600">
                {order.shippingAddress.complement}
              </p>
            )}
            <p className="text-sm text-zinc-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Frete */}
        <div className="border-t border-zinc-200 pt-6 mt-6">
          <div className="flex justify-between items-start mb-2">
            <p>Frete ({order.shippingMethod})</p>
            <p className="font-semibold">
              R$ {Number(order.shippingCost).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
        >
          <Printer size={18} />
          Imprimir
        </button>
        <Link
          href="/"
          className="flex-1 bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-center"
        >
          Continuar Comprando
        </Link>
      </div>

      {/* Rastreamento */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-medium text-blue-900 mb-3">Rastreamento de Entrega</h2>
        <p className="text-sm text-blue-800 mb-4">
          Você pode acompanhar seu pedido através de um e-mail com o código de rastreamento.
        </p>
        {order.trackingCode ? (
          <p className="text-sm font-mono bg-white px-3 py-2 rounded border border-blue-200">
            {order.trackingCode}
          </p>
        ) : (
          <p className="text-sm text-blue-700">
            O código de rastreamento será enviado quando seu pedido for despachado.
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Suspense fallback={<div>Carregando confirmação...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </main>
  );
}
