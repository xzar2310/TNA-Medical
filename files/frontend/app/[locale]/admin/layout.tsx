import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  // Server-side role guard as per claude.md rules
  if (!session || session.user?.role !== 'admin') {
    redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar locale={locale} />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
