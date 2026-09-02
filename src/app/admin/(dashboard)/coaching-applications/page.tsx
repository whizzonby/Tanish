import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { coachingApplicationStatusLabels, coachingApplicationStatuses, isCoachingApplicationStatus } from "@/lib/coaching-applications";
import { deleteCoachingApplication, saveCoachingApplicationNotes, updateCoachingApplicationStatus } from "@/app/admin/actions/coaching-applications";

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700", REVIEWING: "bg-amber-50 text-amber-700",
  FOLLOW_UP: "bg-purple-50 text-purple-700", ACCEPTED: "bg-green-50 text-green-700",
  DECLINED: "bg-navy-800/5 text-navy-800/50",
};

type DetailValue = string | string[] | null;

function object(value: unknown): Record<string, DetailValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, DetailValue> : {};
}

const labels: Record<string, string> = {
  operatingStatus: "Operating", registrationStatus: "Registration", registrationNumber: "Registration number",
  industry: "Industry", description: "Business description", operatingDuration: "Time operating",
  hasEmployees: "Has employees", employeeCount: "Employees", generatesRevenue: "Generates revenue",
  monthlyRevenue: "Monthly revenue", monthlyExpenses: "Monthly expenses", customerSources: "Customer sources",
  goals: "3–6 month goals", biggestChallenge: "Biggest challenge", supportAreas: "Support needed",
  coachingSuccess: "A successful coaching outcome", twelveMonthVision: "12-month vision",
  whyTaniesha: "Why Taniesha", workedWithCoach: "Previously coached", willCompleteTasks: "Will complete tasks",
  weeklyTime: "Weekly time", honestInformation: "Will provide honest information", startTimeline: "Start timeline",
  amount: "Funding amount", use: "Use of funds", growth: "Growth impact", estimatedReturn: "Estimated return",
  repaymentSource: "Repayment source", repaymentPeriod: "Repayment period", hasOtherFinancing: "Other financing",
  otherFinancingDetails: "Financing details",
};

export default async function CoachingApplicationsAdminPage(
  props: { searchParams: Promise<{ status?: string | string[] }> }
) {
  const params = await props.searchParams;
  const requestedStatus = typeof params.status === "string" ? params.status : "";
  const status = isCoachingApplicationStatus(requestedStatus) ? requestedStatus : undefined;
  const [applications, statusCounts] = await Promise.all([
    prisma.coachingApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.coachingApplication.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countByStatus = Object.fromEntries(statusCounts.map((item) => [item.status, item._count._all]));
  const total = statusCounts.reduce((sum, item) => sum + item._count._all, 0);
  return <div>
    <h1 className="font-serif text-2xl font-semibold text-navy-950">Coaching Applications</h1>
    <p className="mt-1 text-sm text-navy-800/60">Business owners who have applied to work with Taniesha.</p>
    <nav aria-label="Filter applications by status" className="mt-6 flex flex-wrap gap-2">
      <FilterLink href="/admin/coaching-applications" active={!status} label="All" count={total} />
      {coachingApplicationStatuses.map((item) => <FilterLink key={item} href={`/admin/coaching-applications?status=${item}`} active={status === item} label={coachingApplicationStatusLabels[item]} count={countByStatus[item] ?? 0} />)}
    </nav>
    <div className="mt-8 space-y-4">
      {applications.map((app) => {
        const groups = [
          ["About the business", object(app.businessDetails)],
          ["Goals and support", object(app.goalsAndSupport)],
          ["Coaching readiness", object(app.coachingReadiness)],
          ...(app.fundingDetails ? [["Funding details", object(app.fundingDetails)] as [string, Record<string, DetailValue>]] : []),
        ] as [string, Record<string, DetailValue>][];
        return <article key={app.id} className="rounded-2xl border border-navy-800/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-navy-950">{app.fullLegalName}<span className={`ml-3 rounded-full px-2.5 py-1 align-middle text-xs font-semibold ${statusStyles[app.status]}`}>{coachingApplicationStatusLabels[app.status]}</span></h2>
              <p className="mt-1 text-sm text-navy-800/60">{app.businessName || "Business name not provided"} · {app.parishCity}, {app.country}</p>
              <p className="mt-1 text-sm"><a href={`mailto:${app.email}`} className="text-gold-600 hover:underline">{app.email}</a> · <a href={`tel:${app.phone}`} className="text-navy-800/70 hover:underline">{app.phone}</a></p>
            </div>
            <div className="flex gap-2">
              <form action={updateCoachingApplicationStatus} className="flex gap-2"><input type="hidden" name="id" value={app.id} /><select name="status" defaultValue={app.status} aria-label={`Status for ${app.fullLegalName}`} className="rounded-lg border border-navy-800/15 px-2 py-1.5 text-xs">{coachingApplicationStatuses.map((status) => <option key={status} value={status}>{coachingApplicationStatusLabels[status]}</option>)}</select><button className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white">Update</button></form>
              <form action={deleteCoachingApplication}><input type="hidden" name="id" value={app.id} /><button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500">Delete</button></form>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><Info label="Preferred name" value={app.preferredName} /><Info label="Age range" value={app.ageRange} /><Info label="Preferred contact" value={app.preferredContactMethod} /><Info label="Funding interest" value={app.fundingInterest} /><Info label="Electronic signature" value={app.electronicSignature} /><Info label="Application date" value={app.applicationDate.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })} /></div>
          <details className="mt-5 border-t border-navy-800/10 pt-4"><summary className="cursor-pointer text-sm font-semibold text-gold-600">View complete application</summary><div className="mt-5 space-y-6">{groups.map(([title, details]) => <section key={title}><h3 className="font-serif font-semibold text-navy-950">{title}</h3><dl className="mt-2 grid gap-3 sm:grid-cols-2">{Object.entries(details).filter(([, value]) => value !== null && value !== "" && (!Array.isArray(value) || value.length)).map(([key, value]) => <Info key={key} label={labels[key] || key} value={Array.isArray(value) ? value.join(", ") : value} />)}</dl></section>)}</div></details>
          <form action={saveCoachingApplicationNotes} className="mt-5 border-t border-navy-800/10 pt-4"><input type="hidden" name="id" value={app.id} /><label className="text-xs font-semibold text-navy-800/50">Private notes<textarea name="notes" rows={2} defaultValue={app.notes ?? ""} className="mt-1 block w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm text-navy-900" /></label><button className="mt-2 rounded-lg border border-navy-800/15 px-3 py-1.5 text-xs font-semibold">Save notes</button></form>
          <p className="mt-3 text-xs text-navy-800/40">Received {app.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
        </article>;
      })}
      {!applications.length && <p className="rounded-2xl border border-dashed border-navy-800/20 bg-white p-8 text-center text-navy-800/50">No coaching applications yet.</p>}
    </div>
  </div>;
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-navy-900 text-cream-50" : "border border-navy-800/15 bg-white text-navy-800/70 hover:bg-cream-100"}`}>{label} <span className={active ? "text-cream-100/65" : "text-navy-800/40"}>{count}</span></Link>;
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div><dt className="text-xs font-semibold text-navy-800/45">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap text-navy-800/80">{value}</dd></div>;
}
