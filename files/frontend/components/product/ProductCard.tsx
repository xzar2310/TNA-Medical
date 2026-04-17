import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Shield } from 'lucide-react';
import { MockProduct } from '@/lib/mockProducts';
import { useCartStore } from '@/lib/store/cartStore';

interface ProductCardProps {
  product: MockProduct;
  locale: 'en' | 'th';
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const name = locale === 'th' ? product.name_th : product.name_en;
  const discount = Math.round(((product.compare_price - product.price) / product.compare_price) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name_en: product.name_en,
      name_th: product.name_th,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-50">
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-orange-50 to-white overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name_en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="absolute top-3 right-3 bg-white/90 text-orange-600 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">{product.category}</span>
          <h3 className="font-display font-bold text-gray-900 mt-1 mb-1 text-base leading-snug line-clamp-2">{name}</h3>

          {/* FDA badge */}
          <div className="flex items-center gap-1 mb-3">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">FDA Reg: {product.fda_registration_number}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            ))}
            <span className="text-xs text-gray-400 ml-1">(128)</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xl font-bold text-orange-600">฿{product.price.toLocaleString()}</span>
              {product.compare_price > product.price && (
                <span className="ml-2 text-sm text-gray-400 line-through">฿{product.compare_price.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-orange-600 border-2 border-orange-500 py-2.5 rounded-2xl font-bold text-sm hover:bg-orange-50 hover:shadow-[0_8px_16px_rgba(249,115,22,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
