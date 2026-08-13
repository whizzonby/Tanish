import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminSignIn } from "@/app/admin/actions/login";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { error } = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/images/logo.jpg"
            alt={siteConfig.brandName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <h1 className="mt-4 font-serif text-xl font-semibold text-navy-950">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-navy-800/60">{siteConfig.domain}</p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {Array.isArray(error) ? error[0] : error}
          </p>
        )}

        <form action={adminSignIn} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-navy-800/15 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
