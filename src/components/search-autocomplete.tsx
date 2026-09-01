"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: string;
  code?: string;
  stock: number;
  images: { url: string }[];
};

export function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (value: string): Promise<void> => {
    if (!value.trim()) {
      setProducts([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(value)}`);
      if (response.ok) {
        const data = await response.json() as Product[];
        setProducts(data.slice(0, 8)); // Limitar a 8 resultados
        setIsOpen(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setProducts([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < products.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          window.location.href = `/produto/${products[selectedIndex].slug}`;
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="relative flex items-center border-b border-zinc-900 pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Buscar por nome, categoria ou SKU"
          className="flex-1 outline-none text-lg"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setProducts([]);
              setIsOpen(false);
            }}
            className="p-2 text-zinc-500 hover:text-zinc-900"
            aria-label="Limpar busca"
          >
            <X size={20} />
          </button>
        )}
        <button aria-label="Buscar" className="ml-2">
          <Search size={20} />
        </button>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (query.trim() || loading) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 rounded-lg mt-1 shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-zinc-500">Buscando...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">Nenhuma peça encontrada</div>
          ) : (
            <>
              <div className="divide-y divide-zinc-100">
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/produto/${product.slug}`}
                    className={`flex gap-3 p-3 hover:bg-zinc-50 transition-colors ${
                      index === selectedIndex ? "bg-zinc-100" : ""
                    }`}
                  >
                    {/* Foto do produto */}
                    <div className="w-16 h-16 bg-zinc-100 rounded flex-shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                          Sem foto
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nome com destaque */}
                      <h3 className="font-medium text-sm line-clamp-2 text-zinc-900">
                        {highlightMatch(product.name, query)}
                      </h3>

                      {/* SKU e disponibilidade */}
                      <div className="flex items-center gap-2 mt-1">
                        {product.code && (
                          <span className="text-xs text-zinc-500">SKU: {product.code}</span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-xs text-red-600 font-medium">Indisponível</span>
                        )}
                        {product.stock > 0 && product.stock < 5 && (
                          <span className="text-xs text-amber-600 font-medium">
                            {product.stock} em estoque
                          </span>
                        )}
                      </div>

                      {/* Preço com parcelamento */}
                      <div className="mt-1">
                        <p className="font-semibold text-sm">
                          R$ {Number(product.price).toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-zinc-500">
                          ou 3x de R$ {(Number(product.price) / 3).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Link "Ver todos os resultados" */}
              {query.trim() && (
                <Link
                  href={`/buscar?q=${encodeURIComponent(query)}`}
                  className="block p-3 text-center text-rose-600 hover:bg-rose-50 border-t border-zinc-100 text-sm font-medium transition-colors"
                >
                  Ver todos os resultados ({query})
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
