import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      products: await prisma.product.findMany({
        where: { isActive: true, categoryId: category.id },
        include: { images: { orderBy: [{ isMain: "desc" }, { id: "asc" }] } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    }))
  );

  // Filtrar apenas categorias com produtos
  const activeCategories = categoriesWithProducts.filter((cat) => cat.products.length > 0);

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative h-[70vh] min-h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2070&auto=format&fit=crop"
            alt="Joias elegantes"
            fill
            className="object-cover opacity-70"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-sm uppercase tracking-[0.3em] mb-4">
            RG Acessórios
          </p>
          <h1 className="text-5xl md:text-7xl font-light mb-6">
            A beleza está nos detalhes
          </h1>
          <Link
            href="/buscar"
            className="inline-flex bg-white text-zinc-900 px-8 py-3 rounded"
          >
            Explorar peças
          </Link>
        </div>
      </section>

      {/* Seções por Categoria */}
      {activeCategories.map((category) => (
        <section key={category.id} className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-light uppercase tracking-wider">
              {category.name}
            </h2>
            <Link href={`/categoria/${category.slug}`} className="text-sm text-rose-500 hover:text-rose-600">
              Ver mais em {category.name} →
            </Link>
          </div>
          {category.products.length === 0 ? (
            <p className="text-zinc-500">Em breve, novas peças nesta categoria.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    <h3 className="mt-3 text-xs font-medium line-clamp-2">{product.name}</h3>
                    <p className="mt-1 font-semibold text-sm">
                      R$ {Number(product.price).toFixed(2).replace(".", ",")}
                    </p>
                  </Link>
                  {product.stock > 0 ? (
                    <Link
                      href={`/produto/${product.slug}`}
                      className="mt-2 inline-flex w-full justify-center rounded-md border border-zinc-900 px-2 py-1.5 text-xs font-medium hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      Ver detalhes
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="mt-2 inline-flex w-full justify-center rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed"
                    >
                      Indisponível
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Fallback se nenhuma categoria tiver produtos */}
      {activeCategories.length === 0 && (
        <section className="container mx-auto px-4">
          <p className="text-zinc-500 text-center">Em breve, novas peças em destaque.</p>
        </section>
      )}
    </div>
  );
}
