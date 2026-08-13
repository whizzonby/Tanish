import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { adminSignOut } from "@/app/admin/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { siteConfig } from "@/lib/site-config";

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 p-5 text-cream-50 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5">
          <Image
            src="/images/logo.jpg"
            alt={siteConfig.brandName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-serif text-sm font-semibold">Admin</span>
        </Link>
        <AdminSidebar />
        <div className="mt-auto space-y-3 border-t border-cream-100/10 pt-4">
          <Link href="/" className="block text-xs text-cream-100/50 hover:text-gold-300">
            &larr; View live site
          </Link>
          <p className="truncate text-xs text-cream-100/50">{session.user?.email}</p>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-cream-100/15 px-3 py-2 text-xs font-semibold text-cream-100/80 transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy-800/10 bg-white px-6 py-4 lg:hidden">
          <span className="font-serif text-lg font-semibold text-navy-950">Admin</span>
          <form action={adminSignOut}>
            <button type="submit" className="text-sm font-medium text-navy-800">
              Sign out
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
