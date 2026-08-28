import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, include: { products: { where: { isActive: true }, include: { images: { where: { isMain: true }, take: 1 } }, orderBy: { createdAt: "desc" } } } });
  if (!category) notFound();
  return <main className="container mx-auto px-4 py-12"><p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-3">Coleção</p><h1 className="text-4xl font-light mb-10">{category.name}</h1>{category.products.length === 0 ? <p className="text-zinc-500">Nenhuma peça disponível nesta categoria.</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{category.products.map((product) => <Link href={`/produto/${product.slug}`} key={product.id} className="group"><div className="relative aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden">{product.images[0] ? <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" /> : <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Sem imagem</div>}</div><h2 className="mt-3 text-sm font-medium">{product.name}</h2><p className="mt-1 font-semibold">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p></Link>)}</div>}</main>;
}