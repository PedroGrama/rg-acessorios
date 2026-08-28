"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Product
const mockProduct = {
  id: "1",
  name: "Colar Coração Ouro 18k com Zircônias Cravejadas",
  price: 199.90,
  compareAtPrice: 249.90,
  description: "Colar delicado com pingente de coração folheado a ouro 18k e zircônias de alta qualidade. Perfeito para uso diário ou ocasiões especiais. Possui camada de verniz antialérgico que garante maior durabilidade e brilho intenso.",
  sku: "CO-OURO-001",
  images: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  ],
  variations: [
    { name: "Banho", values: ["Ouro 18k", "Prata 925", "Ródio Branco"] },
    { name: "Tamanho", values: ["40cm", "45cm", "50cm"] }
  ]
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [cep, setCep] = useState("");

  const handleVariationSelect = (name: string, value: string) => {
    setSelectedVariations(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-900">Início</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/categorias/colares" className="hover:text-zinc-900">Colares</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-zinc-900 truncate max-w-[200px] sm:max-w-none">
          {mockProduct.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-visible snap-x">
            {mockProduct.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 border-2 transition-all rounded-md overflow-hidden snap-start ${
                  activeImage === index ? "border-rose-400" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden group">
            <Image 
              src={mockProduct.images[activeImage]} 
              alt={mockProduct.name} 
              fill 
              className="object-cover object-center" 
              priority
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white/90 p-3 rounded-full shadow-sm hover:bg-white text-zinc-600 hover:text-rose-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="bg-white/90 p-3 rounded-full shadow-sm hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-light text-zinc-900 mb-2 leading-tight">
              {mockProduct.name}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-rose-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                <span className="text-zinc-500 ml-2">(12 avaliações)</span>
              </div>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-500">Ref: {mockProduct.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-zinc-900">
                R$ {mockProduct.price.toFixed(2).replace('.', ',')}
              </span>
              {mockProduct.compareAtPrice && (
                <span className="text-lg text-zinc-400 line-through">
                  R$ {mockProduct.compareAtPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            <p className="text-sm text-green-600 font-medium">
              Em até 3x de R$ {(mockProduct.price / 3).toFixed(2).replace('.', ',')} sem juros
            </p>
          </div>

          {/* Variations */}
          <div className="flex flex-col gap-6 mb-8">
            {mockProduct.variations.map((variation) => (
              <div key={variation.name}>
                <span className="block text-sm font-medium text-zinc-900 mb-3 uppercase tracking-wider">
                  {variation.name}: <span className="font-light normal-case ml-1">{selectedVariations[variation.name] || 'Selecione'}</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {variation.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleVariationSelect(variation.name, val)}
                      className={`px-5 py-2 border text-sm rounded-md transition-all ${
                        selectedVariations[variation.name] === val 
                          ? "border-zinc-900 bg-zinc-900 text-white" 
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Quantity */}
            <div className="flex items-center justify-between border border-zinc-200 rounded-md p-1 w-full sm:w-32 bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-zinc-100 rounded-sm text-zinc-500 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-zinc-100 rounded-sm text-zinc-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md py-6 text-base font-medium shadow-md shadow-rose-200 transition-all uppercase tracking-wider">
              Adicionar ao Carrinho
            </Button>
          </div>

          {/* Shipping Calculator */}
          <div className="border border-zinc-100 bg-zinc-50 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-zinc-700" />
              <span className="font-medium text-zinc-900">Calcular Frete e Prazo</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="00000-000" 
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                maxLength={9}
                className="flex-1 bg-white border border-zinc-200 px-4 py-2 rounded-md text-sm outline-none focus:border-rose-300 transition-colors"
              />
              <Button variant="outline" className="bg-white hover:bg-zinc-100">Calcular</Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-zinc-900 mb-3 uppercase tracking-wider text-sm">Detalhes do Produto</h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-light">
              {mockProduct.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
