"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { LoaderCircle, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };
type Product = { id: string; code?: string | null; name: string; slug: string; description: string; price: string; compareAtPrice?: string | null; stock: number; isActive: boolean; categoryId: string; category?: Category; images: { url: string }[] };
type ProductForm = { id?: string; code: string; name: string; slug: string; description: string; price: string; compareAtPrice: string; stock: string; categoryId: string; imageUrl: string; isActive: boolean };

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const emptyProduct: ProductForm = { code: "", name: "", slug: "", description: "", price: "", compareAtPrice: "", stock: "0", categoryId: "", imageUrl: "", isActive: true };

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [preview, setPreview] = useState("");

  async function api(path: string, options: RequestInit = {}) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new Error("Sua sessão expirou. Entre novamente.");
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
    if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    return fetch(path, { ...options, headers });
  }

  async function loadData() {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([api("/api/admin/products"), api("/api/admin/categories")]);
      if (productsResponse.ok) setProducts(await productsResponse.json());
      if (categoriesResponse.ok) setCategories(await categoriesResponse.json());
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível carregar o painel."); }
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); if (data.session) void loadData(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message); else { setUser(data.user); await loadData(); }
  }

  async function logout() {
    await supabase.auth.signOut(); setUser(null); setProducts([]); router.replace("/admin"); router.refresh();
  }

  function openProduct(product?: Product) {
    const next = product ? { id: product.id, code: product.code ?? "", name: product.name, slug: product.slug, description: product.description, price: String(product.price), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "", stock: String(product.stock), categoryId: product.categoryId, imageUrl: product.images[0]?.url ?? "", isActive: product.isActive } : emptyProduct;
    setForm(next); setPreview(next.imageUrl); setModal(true); setMessage("");
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMessage("Escolha um arquivo de imagem."); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage("A imagem deve ter no máximo 5 MB."); return; }
    setPreview(URL.createObjectURL(file)); setMessage("Enviando imagem...");
    try {
      const data = new FormData(); data.append("file", file);
      const response = await api("/api/admin/upload", { method: "POST", body: data, headers: {} });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error ?? "Não foi possível enviar a imagem."); return; }
      setForm((current) => ({ ...current, imageUrl: result.url })); setPreview(result.url); setMessage("Imagem enviada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar a imagem."); }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await api(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", { method: form.id ? "PUT" : "POST", body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "Não foi possível salvar o produto."); return; }
      setModal(false); setMessage("Produto salvo com sucesso."); await loadData();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar o produto."); }
    finally { setSaving(false); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Excluir ${product.name}?`)) return;
    try { const response = await api(`/api/admin/products/${product.id}`, { method: "DELETE" }); setMessage(response.ok ? "Produto excluído." : "Não foi possível excluir o produto."); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível excluir o produto."); }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    try { const response = await api("/api/admin/categories", { method: editingCategory ? "PATCH" : "POST", body: JSON.stringify({ id: editingCategory?.id, name: categoryName }) }); const data = await response.json(); setMessage(response.ok ? "Categoria salva." : data.error ?? "Não foi possível salvar a categoria."); if (response.ok) { setCategoryName(""); setEditingCategory(null); await loadData(); } }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar a categoria."); }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Excluir a categoria ${category.name}?`)) return;
    try { const response = await api("/api/admin/categories", { method: "DELETE", body: JSON.stringify({ id: category.id }) }); setMessage(response.ok ? "Categoria excluída." : "Não foi possível excluir. Verifique se possui produtos."); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível excluir a categoria."); }
  }

  const filtered = products.filter((product) => { const matchesText = product.name.toLowerCase().includes(query.toLowerCase()) || (product.code ?? "").toLowerCase().includes(query.toLowerCase()); const matchesFilter = filter === "all" || (filter === "low" && product.stock < 5 && product.stock > 0) || (filter === "out" && product.stock === 0) || (filter === "inactive" && !product.isActive); return matchesText && matchesFilter && (!categoryFilter || product.categoryId === categoryFilter); });
  const pageSize = 12; const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!user) return <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6"><form onSubmit={login} className="w-full max-w-md bg-white p-8 rounded-xl space-y-5"><p className="text-xs uppercase tracking-[0.25em] text-rose-500">RG Acessórios</p><h1 className="text-3xl font-light">Painel administrativo</h1><label className="block text-sm">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full border p-3 rounded" /></label><label className="block text-sm">Senha<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full border p-3 rounded" /></label><button className="w-full bg-zinc-900 text-white p-3 rounded">Entrar</button>{message && <p className="text-sm text-red-600">{message}</p>}</form></main>;

  return <main className="min-h-screen bg-zinc-100 p-6 md:p-10"><div className="max-w-7xl mx-auto space-y-8"><header className="flex flex-wrap justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-rose-500">RG Acessórios</p><h1 className="text-4xl font-light">Produtos</h1><p className="text-zinc-500 mt-2">Gerenciar catálogo e estoque</p></div><div className="flex gap-3"><button onClick={() => openProduct()} className="bg-rose-500 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18} /> Novo produto</button><button onClick={logout} className="border border-zinc-300 px-4 py-2 rounded">Sair</button></div></header><section className="flex flex-wrap gap-3"><label className="bg-white border rounded px-3 py-2 flex items-center gap-2"><Search size={17} className="text-zinc-400" /><input placeholder="Buscar produto ou código" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="outline-none" /></label><select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} className="bg-white border rounded px-3"><option value="all">Todos</option><option value="low">Estoque baixo</option><option value="out">Fora de estoque</option><option value="inactive">Inativos</option></select><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }} className="bg-white border rounded px-3"><option value="">Todas categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></section><section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{visible.map((product) => <article key={product.id} className="bg-white rounded-xl overflow-hidden"><div className="aspect-[4/3] bg-zinc-100 relative">{product.images[0] ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Sem imagem</div>}<span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded ${product.stock === 0 ? "bg-red-100 text-red-700" : product.stock < 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{product.stock === 0 ? "Fora de estoque" : product.stock < 5 ? `Baixo: ${product.stock}` : `Estoque: ${product.stock}`}</span></div><div className="p-4 space-y-2"><p className="text-xs text-zinc-500">{product.code ? `Código: ${product.code} · ` : ""}{product.category?.name} {!product.isActive && "· Inativo"}</p><h2 className="font-medium line-clamp-2 min-h-12">{product.name}</h2><p className="font-semibold">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p><div className="flex gap-2 pt-2"><button onClick={() => openProduct(product)} className="flex-1 border rounded py-2 text-sm flex justify-center gap-1"><Pencil size={15} /> Editar</button><button onClick={() => deleteProduct(product)} aria-label={`Excluir ${product.name}`} className="border border-red-200 text-red-600 rounded px-3"><Trash2 size={15} /></button></div></div></article>)}</section>{visible.length === 0 && <p className="text-center text-zinc-500 py-12">Nenhum produto encontrado.</p>}<div className="flex justify-center gap-3"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="border bg-white px-3 py-2 rounded disabled:opacity-40">Anterior</button><span className="px-3 py-2">Página {page} de {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)} className="border bg-white px-3 py-2 rounded disabled:opacity-40">Próxima</button></div><section className="bg-white rounded-xl p-6"><div className="flex flex-wrap justify-between gap-3 mb-4"><div><h2 className="text-xl">Categorias</h2><p className="text-sm text-zinc-500">Crie, edite ou remova categorias.</p></div><form onSubmit={saveCategory} className="flex gap-2"><label className="sr-only">Nome da categoria</label><input required placeholder="Nome da categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="border p-2 rounded" /><button className="bg-zinc-900 text-white px-3 rounded">{editingCategory ? "Atualizar" : "Adicionar"}</button></form></div><div className="flex flex-wrap gap-2">{categories.map((category) => <span key={category.id} className="border px-3 py-2 rounded flex items-center gap-2">{category.name}<button onClick={() => { setEditingCategory(category); setCategoryName(category.name); }} aria-label={`Editar ${category.name}`}><Pencil size={14} /></button><button onClick={() => deleteCategory(category)} aria-label={`Excluir ${category.name}`} className="text-red-600"><Trash2 size={14} /></button></span>)}</div></section>{message && <p className="text-sm text-zinc-600">{message}</p>}</div>{modal && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><form onSubmit={saveProduct} className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto"><div className="flex justify-between"><h2 className="text-2xl font-light">{form.id ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={() => setModal(false)} aria-label="Fechar"><X /></button></div><div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-4"><label className="text-sm">Nome do produto<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label><label className="text-sm">Código SKU<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-sm">Preço de venda<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label><label className="text-sm">Preço promocional<input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-sm">Estoque<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label><label className="text-sm">Categoria<select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="mt-1 w-full border p-3 rounded"><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><label className="text-sm">Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label><label className="text-sm">Descrição<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full border p-3 rounded" /></label><div><span className="block text-sm mb-2">Imagem do produto</span><label className="border-2 border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-rose-400"><Upload className="text-zinc-400" /><span className="text-sm text-zinc-600">Arraste ou escolha uma imagem</span><input type="file" accept="image/*" onChange={chooseFile} className="sr-only" /></label>{preview && <img src={preview} alt="Preview da imagem" className="mt-3 h-32 w-32 object-cover rounded" />}<label className="block text-sm mt-3">URL alternativa<input value={form.imageUrl} onChange={(event) => { setForm({ ...form, imageUrl: event.target.value }); setPreview(event.target.value); }} placeholder="https://..." className="mt-1 w-full border p-3 rounded" /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Produto ativo na loja</label><button disabled={saving} className="w-full bg-rose-500 text-white p-3 rounded flex items-center justify-center gap-2 disabled:opacity-60">{saving && <LoaderCircle className="animate-spin" size={18} />} {saving ? "Salvando..." : "Salvar produto"}</button></form></div>}</main>;
}
