import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { sendTransactionalEmail } from "@/lib/mailtrap";
import { coachingApplicationNotificationEmail } from "@/lib/email-templates";

function str(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(form: FormData, name: string) {
  return str(form, name) || null;
}

function values(form: FormData, name: string) {
  return form.getAll(name).filter((value): value is string => typeof value === "string");
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "The application could not be read." }, { status: 400 });

  const requiredFields = [
    "fullLegalName", "email", "phone", "parishCity", "country", "operatingStatus",
    "registrationStatus", "industry", "businessDescription", "operatingDuration",
    "hasEmployees", "generatesRevenue", "businessGoals", "biggestChallenge",
    "twelveMonthVision", "whyTaniesha", "workedWithCoach", "willCompleteTasks",
    "weeklyTime", "honestInformation", "startTimeline", "fundingInterest",
    "electronicSignature", "applicationDate",
  ];
  if (requiredFields.some((field) => !str(form, field)) || values(form, "supportAreas").length === 0) {
    return NextResponse.json({ error: "Complete all required questions before sending your application." }, { status: 400 });
  }

  const email = str(form, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const consentFields = ["declarationAccepted", "programmeAcknowledged", "resultsAcknowledged", "fundingAcknowledged", "contactConsent"];
  if (consentFields.some((field) => str(form, field) !== "yes")) {
    return NextResponse.json({ error: "Confirm every declaration and consent statement." }, { status: 400 });
  }

  const applicationDate = new Date(`${str(form, "applicationDate")}T12:00:00Z`);
  if (Number.isNaN(applicationDate.getTime())) {
    return NextResponse.json({ error: "Enter a valid application date." }, { status: 400 });
  }

  const fundingInterest = str(form, "fundingInterest");
  const fundingDetails = fundingInterest === "Yes" ? {
    amount: str(form, "fundingAmount"),
    use: str(form, "fundingUse"),
    growth: str(form, "fundingGrowth"),
    estimatedReturn: str(form, "estimatedReturn"),
    repaymentSource: str(form, "repaymentSource"),
    repaymentPeriod: str(form, "repaymentPeriod"),
    hasOtherFinancing: str(form, "hasOtherFinancing"),
    otherFinancingDetails: optional(form, "otherFinancingDetails"),
  } : null;

  if (fundingDetails && Object.entries(fundingDetails).some(([key, value]) => key !== "otherFinancingDetails" && !value)) {
    return NextResponse.json({ error: "Complete all required funding questions." }, { status: 400 });
  }

  try {
    const application = await prisma.coachingApplication.create({
      data: {
        fullLegalName: str(form, "fullLegalName"), preferredName: optional(form, "preferredName"),
        email, phone: str(form, "phone"), parishCity: str(form, "parishCity"), country: str(form, "country"),
        ageRange: optional(form, "ageRange"), preferredContactMethod: optional(form, "preferredContactMethod"),
        businessName: optional(form, "businessName"), fundingInterest,
        ...(fundingDetails ? { fundingDetails } : {}),
        businessDetails: {
          operatingStatus: str(form, "operatingStatus"), registrationStatus: str(form, "registrationStatus"),
          registrationNumber: optional(form, "registrationNumber"), industry: str(form, "industry"),
          description: str(form, "businessDescription"), operatingDuration: str(form, "operatingDuration"),
          hasEmployees: str(form, "hasEmployees"), employeeCount: optional(form, "employeeCount"),
          generatesRevenue: str(form, "generatesRevenue"), monthlyRevenue: optional(form, "monthlyRevenue"),
          monthlyExpenses: optional(form, "monthlyExpenses"), customerSources: values(form, "customerSources"),
        },
        goalsAndSupport: {
          goals: str(form, "businessGoals"), biggestChallenge: str(form, "biggestChallenge"),
          supportAreas: values(form, "supportAreas"), coachingSuccess: optional(form, "coachingSuccess"),
          twelveMonthVision: str(form, "twelveMonthVision"),
        },
        coachingReadiness: {
          whyTaniesha: str(form, "whyTaniesha"), workedWithCoach: str(form, "workedWithCoach"),
          willCompleteTasks: str(form, "willCompleteTasks"), weeklyTime: str(form, "weeklyTime"),
          honestInformation: str(form, "honestInformation"), startTimeline: str(form, "startTimeline"),
        },
        declarationAccepted: true, programmeAcknowledged: true, resultsAcknowledged: true,
        fundingAcknowledged: true, contactConsent: true,
        electronicSignature: str(form, "electronicSignature"), applicationDate,
      },
    });

    try {
      const settings = await getSiteSettings();
      const { subject, html } = coachingApplicationNotificationEmail({
        applicantName: application.fullLegalName, businessName: application.businessName,
        email: application.email, phone: application.phone, fundingInterest: application.fundingInterest,
      });
      await sendTransactionalEmail({ to: settings.email, subject, html });
    } catch (error) {
      // The application is already safely stored; notification problems must
      // not tell the applicant that their submission failed.
      console.error("[coaching/apply] notification failed", error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[coaching/apply] failed to save application", error);
    return NextResponse.json({ error: "We couldn't save your application. Please try again." }, { status: 500 });
  }
}
