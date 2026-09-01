import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { id: "asc" }] },
      variations: true,
    },
  });
  if (!product || !product.isActive) notFound();

  return (
    <main className="container mx-auto px-4 py-10">
      <nav className="text-sm text-zinc-500 mb-8">
        <Link href="/">Início</Link> /{" "}
        <Link href={`/categoria/${product.category.slug}`}>
          {product.category.name}
        </Link>{" "}
        / {product.name}
      </nav>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <ProductGallery
          images={product.images}
          productName={product.name}
          isOutOfStock={product.stock === 0}
        />
        <div>
          <p className="text-sm text-zinc-500">
            {product.category.name}{" "}
            {product.code && `· Código: ${product.code}`}
          </p>
          <h1 className="text-3xl font-light mt-2">{product.name}</h1>
          <p className="text-3xl font-semibold mt-6">
            R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </p>
          {product.compareAtPrice && (
            <p className="text-zinc-400 line-through">
              R$ {Number(product.compareAtPrice).toFixed(2).replace(".", ",")}
            </p>
          )}
          <p className="text-zinc-600 leading-relaxed mt-8 whitespace-pre-line">
            {product.description}
          </p>
          {product.variations.length > 0 && (
            <div className="mt-8">
              <h2 className="font-medium mb-3">Opções</h2>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variation) => (
                  <span
                    key={variation.id}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {variation.name}: {variation.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8">
            {product.stock === 0 ? (
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded">
                Produto esgotado
              </span>
            ) : product.stock === 1 ? (
              <p className="text-sm text-amber-700 font-medium">
                Última unidade disponível!
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                {product.stock} unidades disponíveis
              </p>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={Number(product.price)}
            stock={product.stock}
            image={product.images[0]?.url}
          />
        </div>
      </div>
    </main>
  );
}
