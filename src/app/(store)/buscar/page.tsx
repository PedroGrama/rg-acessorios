"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SearchAutocomplete } from "@/components/search-autocomplete";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  images: { url: string }[];
};

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialQuery) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(initialQuery)}`
        );
        if (response.ok) {
          setProducts(await response.json());
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialQuery]);

  return (
    <>
      {initialQuery && (
        <>
          {loading ? (
            <p className="text-center text-zinc-500">Buscando...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-zinc-500">
              Nenhuma peça encontrada para "{initialQuery}".
            </p>
          ) : (
            <>
              <p className="text-sm text-zinc-500 mb-6">
                {products.length} resultado{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    href={`/produto/${product.slug}`}
                    key={product.id}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                          Sem imagem
                        </div>
                      )}
                      {product.stock === 0 && (
                        <span className="absolute top-3 left-3 bg-zinc-900/80 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm">
                          Indisponível
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-sm font-medium line-clamp-2">{product.name}</h2>
                    <p className="mt-1 font-semibold">
                      R$ {Number(product.price).toFixed(2).replace(".", ",")}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
          Catálogo RG
        </p>
        <h1 className="text-4xl font-light mb-8">Encontre sua peça</h1>
        <div className="mb-12">
          <SearchAutocomplete />
        </div>
      </div>

      <Suspense fallback={<div>Carregando resultados...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
