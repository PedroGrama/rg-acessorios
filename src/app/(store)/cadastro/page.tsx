"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/carrinho";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  async function register(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    // Validar se as senhas coincidem
    if (password !== confirmPassword) {
      setLoading(false);
      setMessageType("error");
      setMessage("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    // Validar comprimento mínimo de senha
    if (password.length < 6) {
      setLoading(false);
      setMessageType("error");
      setMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    if (data.session) {
      // Se login foi automático (confirmação desabilitada ou session imediata)
      router.push(next);
      router.refresh();
      return;
    }

    setMessageType("success");
    setMessage(
      "Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Após confirmar, você poderá acessar sua conta com o carrinho preservado.",
    );
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <form onSubmit={register} className="w-full max-w-md space-y-5">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
          RG Acessórios
        </p>
        <h1 className="text-4xl font-light">Criar sua conta</h1>
        <p className="text-sm text-zinc-500">
          Cadastre-se para concluir suas compras e acompanhar seus pedidos. Seus itens no carrinho serão mantidos.
        </p>
        <input
          required
          placeholder="Nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <input
          required
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <input
          required
          minLength={6}
          type="password"
          placeholder="Crie uma senha (mínimo 6 caracteres)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <input
          required
          minLength={6}
          type="password"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full border border-zinc-200 p-3 rounded-md focus:border-zinc-900 outline-none"
        />
        <button
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-3 rounded-md font-medium hover:bg-zinc-800 disabled:opacity-60 transition-colors"
        >
          {loading ? "Cadastrando..." : "Criar cadastro"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              messageType === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : messageType === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {message}
          </div>
        )}

        <p className="text-sm text-zinc-500">
          Já possui conta?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-rose-500 underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
