"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const emptyForm = { name: "", slug: "", description: "", price: "", compareAtPrice: "", stock: "0", categoryId: "", imageUrl: "" };

type Product = { id: string; name: string; slug: string; price: string; stock: number; category?: { name: string } };
type Category = { id: string; name: string; slug: string };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function api(path: string, options: RequestInit = {}) {
    const { data } = await supabase.auth.getSession();
    return fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` } });
  }

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function loadData() {
      const [productResponse, categoryResponse] = await Promise.all([api("/api/admin/products"), api("/api/admin/categories")]);
      if (!active) return;
      if (productResponse.ok) setProducts(await productResponse.json());
      if (categoryResponse.ok) setCategories(await categoryResponse.json());
    }

    void loadData();
    return () => { active = false; };
  }, [user]);

  async function login(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setUser(data.user);
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    const response = await api("/api/admin/products", { method: "POST", body: JSON.stringify(form) });
    if (!response.ok) { setMessage("Não foi possível salvar o produto."); return; }
    setForm(emptyForm); setMessage("Produto salvo.");
  }

  if (!user) return <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6"><form onSubmit={login} className="w-full max-w-md bg-white p-8 rounded-xl space-y-5"><p className="text-xs uppercase tracking-[0.25em] text-rose-500">RG Acessórios</p><h1 className="text-3xl font-light">Painel administrativo</h1><input required type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border p-3 rounded" /><input required type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border p-3 rounded" /><button className="w-full bg-zinc-900 text-white p-3 rounded">Entrar</button>{message && <p className="text-sm text-red-600">{message}</p>}</form></main>;

  return <main className="min-h-screen bg-zinc-100 p-6 md:p-10"><div className="max-w-6xl mx-auto space-y-8"><header className="flex justify-between items-start"><div><p className="text-xs uppercase tracking-[0.25em] text-rose-500">RG Acessórios</p><h1 className="text-4xl font-light">Produtos</h1><p className="text-zinc-500 mt-2">Gestão da loja para {user.email}</p></div><button onClick={() => supabase.auth.signOut()} className="border border-zinc-300 px-4 py-2 rounded">Sair</button></header><section className="grid lg:grid-cols-[1fr_1.3fr] gap-8"><form onSubmit={saveProduct} className="bg-white p-6 rounded-xl space-y-4"><h2 className="text-xl">Novo produto</h2>{(["name", "slug", "description", "price", "compareAtPrice", "stock", "imageUrl"] as const).map((field) => <input key={field} required={field === "name" || field === "slug" || field === "price"} placeholder={{ name: "Nome", slug: "Slug", description: "Descrição", price: "Preço", compareAtPrice: "Preço anterior", stock: "Estoque", imageUrl: "URL da imagem" }[field]} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="w-full border p-3 rounded" />)}<select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="w-full border p-3 rounded"><option value="">Categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className="w-full bg-rose-500 text-white p-3 rounded">Salvar produto</button>{message && <p className="text-sm text-zinc-600">{message}</p>}</form><section className="bg-white p-6 rounded-xl"><h2 className="text-xl mb-4">Catálogo ({products.length})</h2><div className="divide-y">{products.map((product) => <div key={product.id} className="py-4 flex justify-between gap-4"><div><p className="font-medium">{product.name}</p><p className="text-sm text-zinc-500">{product.category?.name ?? "Sem categoria"} · Estoque: {product.stock}</p></div><span>R$ {Number(product.price).toFixed(2).replace(".", ",")}</span></div>)}</div></section></section></div></main>;
}