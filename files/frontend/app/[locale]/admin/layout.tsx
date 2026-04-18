import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // NOTE: Auth guard is relaxed for local development.
  // Re-enable by uncommenting the block below when backend auth is live.
  //
  // const session = await auth();
  // if (!session || session.user?.role !== 'admin') {
  //   redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  // }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar locale={locale} />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
