"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import CartDrawer from '@/components/cart/CartDrawer';

interface NavbarProps {
  locale: 'en' | 'th';
}

export default function Navbar({ locale }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.itemCount());

  const otherLocale = locale === 'en' ? 'th' : 'en';
  const pathname = usePathname();
  const localeSwitchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-32 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
            <Image 
              src="/images/tna-logo.png" 
              alt="TNA Medical — Healthcare for All" 
              width={320} 
              height={100} 
              className="h-16 w-auto scale-[2.0] origin-left ml-4"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link href={`/${locale}/products`} className="hover:text-orange-600 transition-colors">Products</Link>
            <Link href={`/${locale}/blog`} className="hover:text-orange-600 transition-colors">Blog</Link>
            {(session?.user as any)?.role === 'admin' && (
              <Link href={`/${locale}/admin`} className="hover:text-orange-600 transition-colors">Admin</Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Locale toggle */}
            <Link href={localeSwitchPath}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">
              <Globe className="w-4 h-4" />
              {otherLocale.toUpperCase()}
            </Link>

            {/* Cart */}
            <button
              id="cart-icon"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-orange-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {session ? (
              <button onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                Sign Out
              </button>
            ) : (
              <Link href={`/${locale}/login`} id="nav-login"
                className="hidden sm:block text-sm font-semibold px-4 py-2 bg-white text-orange-600 border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition-all duration-200">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-orange-100 bg-white px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
            <Link href={`/${locale}/products`} onClick={() => setMenuOpen(false)}>Products</Link>
            <Link href={`/${locale}/blog`} onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link href={localeSwitchPath} onClick={() => setMenuOpen(false)}>Switch to {otherLocale.toUpperCase()}</Link>
            {session ? (
              <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="text-left">Sign Out</button>
            ) : (
              <Link href={`/${locale}/login`} onClick={() => setMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} locale={locale} />
    </>
  );
}
