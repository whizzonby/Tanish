import Link from "next/link";
import { ServiceForm } from "@/components/admin/service-form";
import { createService } from "@/app/admin/actions/services";

export default function AdminNewServicePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/services" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Services
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">Add service</h1>
      <div className="mt-8">
        <ServiceForm action={createService} />
      </div>
    </div>
  );
}
