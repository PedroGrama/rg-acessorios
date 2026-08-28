import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true, images: true, variations: true } });
  if (!product || !product.isActive) notFound();
  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0];
  return <main className="container mx-auto px-4 py-10"><nav className="text-sm text-zinc-500 mb-8"><Link href="/">Início</Link> / <Link href={`/categoria/${product.category.slug}`}>{product.category.name}</Link> / {product.name}</nav><div className="grid lg:grid-cols-2 gap-12"><div className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden">{mainImage ? <Image src={mainImage.url} alt={mainImage.alt ?? product.name} fill className="object-cover" priority /> : <div className="h-full flex items-center justify-center text-zinc-400">Sem imagem</div>}</div><div><p className="text-sm text-zinc-500">{product.category.name} {product.code && `· Código: ${product.code}`}</p><h1 className="text-3xl font-light mt-2">{product.name}</h1><p className="text-3xl font-semibold mt-6">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>{product.compareAtPrice && <p className="text-zinc-400 line-through">R$ {Number(product.compareAtPrice).toFixed(2).replace(".", ",")}</p>}<p className="text-zinc-600 leading-relaxed mt-8">{product.description}</p>{product.variations.length > 0 && <div className="mt-8"><h2 className="font-medium mb-3">Opções</h2><div className="flex flex-wrap gap-2">{product.variations.map((variation) => <span key={variation.id} className="border px-3 py-2 rounded text-sm">{variation.name}: {variation.value}</span>)}</div></div>}<p className="mt-8 text-sm text-zinc-500">{product.stock > 0 ? `${product.stock} unidades disponíveis` : "Produto esgotado"}</p></div></div></main>;
}
