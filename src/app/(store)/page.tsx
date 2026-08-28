import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Placeholder data for frontend dev
const featuredProducts = [
  {
    id: "1",
    name: "Colar Coração Ouro 18k",
    price: 199.90,
    compareAtPrice: 249.90,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",
    isNew: true,
  },
  {
    id: "2",
    name: "Brinco Argola Zircônia",
    price: 89.90,
    compareAtPrice: null,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",
    isNew: false,
  },
  {
    id: "3",
    name: "Pulseira Prata Esterlina",
    price: 149.90,
    compareAtPrice: 199.90,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop",
    isNew: true,
  },
  {
    id: "4",
    name: "Anel Solitário Diamante",
    price: 399.90,
    compareAtPrice: null,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop",
    isNew: false,
  },
];

const categories = [
  { name: "Colares", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop" },
  { name: "Brincos", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop" },
  { name: "Pulseiras", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop" },
  { name: "Anéis", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" },
  { name: "Conjuntos", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2070&auto=format&fit=crop" 
            alt="Joias elegantes de alta qualidade"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 z-10 text-center text-white flex flex-col items-center">
          <span className="text-sm uppercase tracking-[0.3em] mb-4 opacity-80">Nova Coleção</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight max-w-3xl">
            A Beleza Está <br /> <span className="font-serif italic">Nos Detalhes</span>
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 max-w-xl mb-10">
            Descubra a nova coleção exclusiva de joias e semijoias da RG Acessórios. Feitas para realçar sua essência.
          </p>
          <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full px-8 py-6 text-base shadow-2xl transition-transform hover:scale-105">
            Comprar Agora <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-light text-center mb-10 tracking-wider uppercase">Nossas Categorias</h2>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
          {categories.map((cat, i) => (
            <Link key={i} href="#" className="flex flex-col items-center gap-3 min-w-[120px] snap-center group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-rose-200 transition-all p-1">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl font-light tracking-wider uppercase">Destaques</h2>
          <Link href="/produtos" className="text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
            Ver tudo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link href={`/produto/${product.id}`} key={product.id} className="group flex flex-col gap-3">
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-zinc-900 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest rounded-sm">
                      Novo
                    </span>
                  )}
                  {product.compareAtPrice && (
                    <span className="bg-rose-500 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest rounded-sm">
                      Promoção
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-1 text-zinc-400">
                  <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <span className="text-[10px] ml-1">(5)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-zinc-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-zinc-400 line-through">
                      R$ {product.compareAtPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="bg-rose-50/50 mt-8">
        <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
          <h2 className="text-2xl font-serif mb-4 text-zinc-900">Receba Novidades</h2>
          <p className="text-zinc-600 mb-8 font-light">
            Cadastre-se para receber 10% de desconto na sua primeira compra e acesso antecipado aos lançamentos.
          </p>
          <form className="flex max-w-md mx-auto gap-2">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="flex-1 bg-white border border-zinc-200 px-4 py-3 rounded-full text-sm outline-none focus:border-rose-300 transition-colors"
            />
            <Button className="bg-zinc-900 text-white rounded-full px-6 hover:bg-zinc-800">
              Assinar
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
