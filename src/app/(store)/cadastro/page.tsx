"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function register(event: FormEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    setMessage(error ? error.message : "Cadastro realizado. Confira seu e-mail para confirmar a conta.");
  }

  return <main className="min-h-[70vh] flex items-center justify-center px-4 py-16"><form onSubmit={register} className="w-full max-w-md space-y-5"><p className="text-xs uppercase tracking-[0.25em] text-rose-500">RG Acessórios</p><h1 className="text-4xl font-light">Criar sua conta</h1><p className="text-sm text-zinc-500">Acompanhe seus pedidos e tenha uma experiência mais simples.</p><input required placeholder="Nome completo" value={name} onChange={(event) => setName(event.target.value)} className="w-full border border-zinc-200 p-3 rounded-md" /><input required type="email" placeholder="Seu melhor e-mail" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-zinc-200 p-3 rounded-md" /><input required minLength={6} type="password" placeholder="Crie uma senha" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-zinc-200 p-3 rounded-md" /><button className="w-full bg-zinc-900 text-white py-3 rounded-md">Criar cadastro</button>{message && <p className="text-sm text-zinc-600">{message}</p>}<p className="text-sm text-zinc-500">Já possui conta? <Link href="/admin" className="text-rose-500 underline">Entrar</Link></p></form></main>;
}