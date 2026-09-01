"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Check, Copy, AlertCircle } from "lucide-react";

function PixPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copied, setCopied] = useState(false);
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

  const handleCopyPix = () => {
    const pixCode = "00020126360014br.gov.bcb.pix0136" + order.id;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
        Pagamento PIX
      </p>
      <h1 className="text-4xl font-light mb-8">Escaneie o QR Code</h1>

      <div className="bg-white border-2 border-zinc-200 rounded-lg p-8 mb-8">
        {/* QR Code simulado */}
        <div className="bg-zinc-100 w-full aspect-square rounded-lg flex items-center justify-center mb-4">
          <div className="text-center text-zinc-400">
            <p className="text-sm">QR Code PIX</p>
            <p className="text-xs mt-2">(Simulado)</p>
          </div>
        </div>

        <div className="space-y-2 text-center text-sm text-zinc-600">
          <p>Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="font-semibold text-lg text-zinc-900">
            R$ {Number(order.total).toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      {/* Chave PIX para copiar */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-6">
        <p className="text-xs text-zinc-500 mb-2">OU COPIE A CHAVE PIX</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-white px-3 py-2 rounded border border-zinc-200 text-xs break-all">
            00020126360014br.gov.bcb.pix0136{order.id}
          </code>
          <button
            onClick={handleCopyPix}
            className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-medium text-blue-900 mb-2 text-sm">Como funciona:</h2>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Abra seu app bancário</li>
          <li>Escolha a opção PIX</li>
          <li>Escaneie o QR Code ou cole a chave</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>

      {/* Status */}
      <div className="text-center text-sm text-zinc-600 mb-6">
        <p>Status do pedido: <strong className="text-amber-600">Aguardando Pagamento</strong></p>
      </div>

      {/* Botões de ação */}
      <div className="space-y-2">
        <button
          onClick={() => router.push("/")}
          className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          Voltar à Loja
        </button>
        <Link
          href="/conta/pedidos"
          className="block text-center text-rose-600 hover:text-rose-700 text-sm font-medium"
        >
          Acompanhar Pedido
        </Link>
      </div>

      {/* Nota importante */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        <p className="font-medium mb-1">⚠ Nota importante:</p>
        <p>Este é um ambiente de demonstração. Em produção, a integração real com PagSeguro processará o pagamento e confirmará automaticamente.</p>
      </div>
    </div>
  );
}

export default function PixPaymentPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Suspense fallback={<div>Carregando...</div>}>
        <PixPaymentForm />
      </Suspense>
    </main>
  );
}
