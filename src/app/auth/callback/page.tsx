"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(
            errorDescription || "Ocorreu um erro ao confirmar seu e-mail. Por favor, tente novamente."
          );
          return;
        }

        if (code) {
          // Usar o código para fazer exchange
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            setStatus("error");
            setMessage(
              "Erro ao confirmar e-mail. O link pode ter expirado. Por favor, faça login ou cadastre-se novamente."
            );
            return;
          }

          setStatus("success");
          setMessage("E-mail confirmado com sucesso!");

          // Redirecionar para carrinho após 2 segundos
          setTimeout(() => {
            router.push("/carrinho");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Link de confirmação inválido ou expirado.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Ocorreu um erro inesperado. Por favor, tente novamente.");
        console.error(err);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
          RG Acessórios
        </p>

        {status === "loading" && (
          <>
            <h1 className="text-4xl font-light">Confirmando e-mail...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-light">E-mail confirmado!</h1>
            <p className="text-zinc-600">
              Sua conta foi ativada com sucesso. Você será redirecionado para o carrinho em breve.
            </p>
            <Link href="/carrinho" className="inline-block text-rose-600 hover:text-rose-700 font-medium">
              Ir para o carrinho agora
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-light">Erro na confirmação</h1>
            <p className="text-zinc-600">{message}</p>
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full bg-zinc-900 text-white py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors"
              >
                Fazer login
              </Link>
              <Link
                href="/cadastro"
                className="block w-full border border-zinc-200 text-zinc-900 py-3 rounded-md font-medium hover:bg-zinc-50 transition-colors"
              >
                Criar nova conta
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Carregando...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
