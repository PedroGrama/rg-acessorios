"use client";

import { useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  images: { url: string; alt?: string | null }[];
  productName: string;
  isOutOfStock?: boolean;
};

export function ProductGallery({
  images,
  productName,
  isOutOfStock,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden border border-zinc-100">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">
            Sem imagem
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-zinc-900/85 backdrop-blur-sm text-white text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded">
            Indisponível
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={image.url + index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-200"
                    : "border-zinc-200 hover:border-zinc-400 opacity-75 hover:opacity-100"
                }`}
                aria-label={`Ver imagem ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={`Miniatura ${index + 1} de ${productName}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
