"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

type Product = { id: string; slug: string; name: string; price: string; compareAtPrice?: string | null; images: { url: string }[] };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(value: string) {
    setLoading(true);
    const response = await fetch(`/api/products?q=${encodeURIComponent(value)}`);
    if (response.ok) setProducts(await response.json());
    setLoading(false);
  }

  function submit(event: FormEvent) { event.preventDefault(); void search(query); }

  return <main className="container mx-auto px-4 py-12"><div className="max-w-2xl mx-auto"><p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">Catálogo RG</p><h1 className="text-4xl font-light mb-8">Encontre sua peça</h1><form onSubmit={submit} className="flex border-b border-zinc-900 pb-3 mb-12"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou categoria" className="flex-1 outline-none text-lg" /><button aria-label="Buscar"><Search /></button></form></div>{loading ? <p className="text-center text-zinc-500">Buscando...</p> : products.length === 0 ? <p className="text-center text-zinc-500">Nenhuma peça encontrada.</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{products.map((product) => <Link href={`/produto/${product.slug}`} key={product.id} className="group"><div className="relative aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden">{product.images[0] ? <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" /> : <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Sem imagem</div>}</div><h2 className="mt-3 text-sm font-medium">{product.name}</h2><p className="mt-1 font-semibold">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p></Link>)}</div>}</main>;
}