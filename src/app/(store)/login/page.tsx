"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";
import { setCurrentCartUserId } from "@/lib/cart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/carrinho";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCurrentCartUserId(data.user?.id ?? null);
    router.push(next);
    router.refresh();
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <form onSubmit={login} className="w-full max-w-md space-y-5">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
          RG Acessórios
        </p>
        <h1 className="text-4xl font-light">Entrar</h1>
        <p className="text-sm text-zinc-500">
          Entre com seu e-mail e senha para continuar sua compra.
        </p>
        <input
          required
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <input
          required
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <button
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-3 rounded-md font-medium hover:bg-zinc-800 disabled:opacity-60 transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {message && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {message}
          </p>
        )}

        <p className="text-sm text-zinc-500">
          Ainda não possui conta?{" "}
          <Link
            href={`/cadastro?next=${encodeURIComponent(next)}`}
            className="text-rose-500 underline font-medium"
          >
            Criar cadastro
          </Link>
        </p>
      </form>
    </main>
  );
}
