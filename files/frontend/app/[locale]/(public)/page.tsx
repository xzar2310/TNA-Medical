import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import TrustBadges from '@/components/common/TrustBadges';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';
import FeaturedProducts from './FeaturedProducts';
import { ShieldCheck, Truck, RefreshCcw, HeartPulse } from 'lucide-react';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: 'en' | 'th' };
}) {
  const t = await getTranslations('Index');
  const featured = MOCK_PRODUCTS.filter((p) => p.is_featured);

  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 py-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-100/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-orange-200">
              <HeartPulse className="w-4 h-4" />
              Thai FDA Certified Supplements
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              {t('description')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href={`/${locale}/products`}
                className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-2xl font-bold text-lg hover:bg-orange-50 hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:-translate-y-1 transition-all duration-300">
                {t('shopNow')}
              </Link>
              <Link href={`/${locale}/products`}
                className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-orange-200">
                View Products →
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-50 rounded-full blur-xl opacity-60" />
              <Image
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80"
                alt="Premium supplements"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
                priority
                sizes="420px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ──────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8">
          <TrustBadges />
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-orange-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: 'FDA Certified', desc: 'All products registered with Thai FDA (อย.)' },
            { icon: Truck, title: 'Free Delivery', desc: 'Free shipping on orders over ฿990' },
            { icon: RefreshCcw, title: '30-Day Returns', desc: 'Hassle-free return policy' },
            { icon: HeartPulse, title: 'Clinically Backed', desc: 'PubMed-referenced ingredients' },
          ].map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
              <b.icon className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">{b.title}</h3>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">Best Sellers</span>
              <h2 className="font-display text-3xl font-extrabold text-gray-900 mt-1">Featured Products</h2>
            </div>
            <Link href={`/${locale}/products`} className="text-sm font-semibold text-orange-600 hover:underline">
              View All →
            </Link>
          </div>
          <FeaturedProducts products={featured} locale={locale} />
        </div>
      </section>
    </main>
  );
}
