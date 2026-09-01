import Link from "next/link";
import { ShoppingCart, Search, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CartBadge } from "@/components/cart-badge";
import { CartLink } from "@/components/cart-link";
import { UserNav } from "@/components/user-nav";

const WHATSAPP_URL = "https://wa.me/5531975045270?text=Olá%20Dona%20Raphaela,%20vim%20pelo%20site!";
const INSTAGRAM_URL = "https://www.instagram.com/raphaelagrama.acessorios/";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 });
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex flex-col">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/buscar" aria-label="Buscar" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-zinc-600" />
            </Link>
          </div>

          <Link href="/" className="text-xl font-bold tracking-widest uppercase">
            RG Acessórios
          </Link>

          <div className="flex items-center gap-4">
            <UserNav />
            <CartLink />
          </div>
        </div>

        {/* Sub-header Navigation */}
        <div className="hidden md:flex border-t border-zinc-100 bg-white">
          <div className="container mx-auto px-4 h-12 flex items-center justify-center gap-8 text-xs uppercase tracking-wider font-medium text-zinc-600">
            {categories.map((category) => <Link key={category.id} href={`/categoria/${category.slug}`} className="hover:text-rose-500 transition-colors">{category.name}</Link>)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-100 py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">RG Acessórios</h3>
            <p className="text-zinc-500 text-sm">
              Joias e semijoias de alta qualidade, feitas para realçar sua beleza.
            </p>
          </div>
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider text-sm">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-900">Sobre nós</a></li>
              <li><Link href="/contato" className="hover:text-zinc-900">Contato</Link></li>
              <li><Link href="/trocas" className="hover:text-zinc-900">Trocas e Devoluções</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider text-sm">Redes Sociais</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-900">Instagram</a></li>
              <li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-900">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} RG Acessórios. Todos os direitos reservados.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
