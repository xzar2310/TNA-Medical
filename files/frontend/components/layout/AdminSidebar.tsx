"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', href: 'admin', icon: LayoutDashboard },
  { label: 'Products', href: 'admin/products', icon: Package },
  { label: 'Orders', href: 'admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: 'admin/customers', icon: Users },
  { label: 'Reports', href: 'admin/reports', icon: BarChart3 },
];

export default function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="font-display font-extrabold text-orange-600 text-lg">TNA Admin</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.href} href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-orange-50 text-orange-600 border border-orange-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
