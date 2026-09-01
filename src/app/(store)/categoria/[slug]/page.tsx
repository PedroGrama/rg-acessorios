import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: { images: { orderBy: [{ isMain: "desc" }, { id: "asc" }] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!category) notFound();
  return (
    <main className="container mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">
        Coleção
      </p>
      <h1 className="text-4xl font-light mb-10">{category.name}</h1>
      {category.products.length === 0 ? (
        <p className="text-zinc-500">
          Nenhuma peça disponível nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/produto/${product.slug}`} className="block">
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
                <h2 className="mt-3 text-sm font-medium">{product.name}</h2>
                <p className="mt-1 font-semibold">
                  R$ {Number(product.price).toFixed(2).replace(".", ",")}
                </p>
              </Link>
              {product.stock > 0 ? (
                <Link
                  href={`/produto/${product.slug}`}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-zinc-900 px-3 py-2 text-sm font-medium hover:bg-zinc-900 hover:text-white"
                >
                  Ver detalhes
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-3 inline-flex w-full cursor-not-allowed justify-center rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-400"
                >
                  Indisponível
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
