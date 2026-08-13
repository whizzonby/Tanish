import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";
import { updateService } from "@/app/admin/actions/services";

export default async function AdminEditServicePage(
  props: PageProps<"/admin/services/[id]">
) {
  const { id } = await props.params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { availabilityRules: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!service) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/services" className="text-sm text-navy-800/60 hover:text-navy-900">
        &larr; Back to Services
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-950">Edit service</h1>
      <div className="mt-8">
        <ServiceForm action={updateService} service={service} availabilityRules={service.availabilityRules} />
      </div>
    </div>
  );
}
