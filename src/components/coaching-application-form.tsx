"use client";

import { useState, type FormEvent, type FocusEvent } from "react";

const sections = [
  "Personal information",
  "About your business",
  "Your business goals",
  "Coaching readiness",
  "Funding interest",
  "Declaration & consent",
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-navy-800/15 bg-white px-4 py-3 text-sm text-navy-950 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

export function CoachingApplicationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fundingInterest, setFundingInterest] = useState("");
  const [activeSection, setActiveSection] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/coaching/apply", {
        method: "POST",
        body: new FormData(formElement),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(data?.error ?? `We couldn't send your application (error ${response.status}).`);
        setStatus("error");
        return;
      }
      formElement.reset();
      setFundingInterest("");
      setStatus("done");
    } catch {
      setMessage("We couldn't connect to the application service. Check your connection and try again.");
      setStatus("error");
    }
  }

  function trackSection(event: FocusEvent<HTMLFormElement>) {
    const fieldset = (event.target as HTMLElement).closest<HTMLElement>("[data-section]");
    if (fieldset?.dataset.section) setActiveSection(Number(fieldset.dataset.section));
  }

  if (status === "done") {
    return (
      <div className="rounded-[2rem] border border-gold-500/30 bg-white px-6 py-16 text-center shadow-sm sm:px-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-2xl text-navy-950">✓</div>
        <h2 className="mt-6 font-serif text-3xl font-semibold text-navy-950">Application received</h2>
        <p className="mx-auto mt-3 max-w-lg text-navy-800/70">
          Thank you for sharing your business with us. Applications are reviewed individually,
          and we&apos;ll contact you if there&apos;s a strong fit for the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <aside className="lg:sticky lg:top-28">
        <p className="font-serif text-lg font-semibold text-navy-950">Your application</p>
        <p className="mt-2 text-sm leading-6 text-navy-800/60">
          Allow about 10–15 minutes. Required questions are marked with an asterisk.
        </p>
        <ol className="mt-6 hidden border-l border-navy-800/15 lg:block">
          {sections.map((section, index) => (
            <li key={section} className="relative pl-5 py-2">
              <span className={`absolute -left-1 top-4 h-2 w-2 rounded-full ${index === activeSection ? "bg-gold-500 ring-4 ring-gold-500/15" : "bg-cream-300"}`} />
              <span className={`text-sm ${index === activeSection ? "font-semibold text-navy-950" : "text-navy-800/50"}`}>{section}</span>
            </li>
          ))}
        </ol>
      </aside>

      <form onSubmit={onSubmit} onFocusCapture={trackSection} className="space-y-8">
        <FormSection number={1} title="Personal information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full legal name" name="fullLegalName" required />
            <Field label="Preferred name" name="preferredName" />
            <Field label="Email address" name="email" type="email" required />
            <Field label="WhatsApp / telephone number" name="phone" type="tel" required />
            <Field label="Parish / city" name="parishCity" required />
            <Field label="Country" name="country" required defaultValue="Jamaica" />
            <Select label="Age range" name="ageRange" options={["18–24", "25–34", "35–44", "45–54", "55+"]} />
            <Select label="Preferred contact method" name="preferredContactMethod" options={["WhatsApp", "Phone", "Email"]} />
          </div>
        </FormSection>

        <FormSection number={2} title="About your business">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name" name="businessName" />
            <Select label="Is your business currently operating?" name="operatingStatus" required options={["Yes", "No", "Preparing to launch"]} />
            <Select label="Is your business registered?" name="registrationStatus" required options={["Yes", "No", "Registration in progress"]} />
            <Field label="Business registration number" name="registrationNumber" />
            <Select label="Industry" name="industry" required options={["Beauty & wellness", "Construction & trades", "Creative services", "Education", "Food & beverage", "Health", "Professional services", "Retail", "Technology", "Tourism & hospitality", "Other"]} />
            <Select label="How long have you been operating?" name="operatingDuration" required options={["Not started", "Less than 6 months", "6–12 months", "1–2 years", "3–5 years", "5+ years"]} />
            <Select label="Do you currently have employees?" name="hasEmployees" required options={["Yes", "No"]} />
            <Field label="Number of employees" name="employeeCount" type="number" min="0" />
            <Select label="Does your business generate revenue?" name="generatesRevenue" required options={["Yes", "No"]} />
            <Select label="Average monthly revenue (JMD)" name="monthlyRevenue" options={["No revenue yet", "Under $50,000", "$50,000–$149,999", "$150,000–$299,999", "$300,000–$499,999", "$500,000–$999,999", "$1,000,000+"]} />
            <Select label="Average monthly expenses (JMD)" name="monthlyExpenses" options={["Under $25,000", "$25,000–$74,999", "$75,000–$149,999", "$150,000–$299,999", "$300,000–$499,999", "$500,000+"]} />
          </div>
          <TextArea label="Briefly describe your business" name="businessDescription" required />
          <CheckboxGroup label="How do customers currently find your business?" name="customerSources" options={["Social media", "Referrals", "Website", "Walk-ins", "Advertising", "Marketplace", "Other"]} />
        </FormSection>

        <FormSection number={3} title="Your business goals">
          <TextArea label="What are your top 3 business goals for the next 3–6 months?" name="businessGoals" required />
          <TextArea label="What is currently your biggest business challenge?" name="biggestChallenge" required />
          <CheckboxGroup label="Which areas do you need help with?" name="supportAreas" required options={["Business planning", "Marketing", "Sales", "Branding", "Financial management", "Pricing", "Customer acquisition", "Operations", "Business registration", "Social media", "Growth strategy", "Accountability", "Other"]} />
          <TextArea label="What would make coaching successful for you?" name="coachingSuccess" />
          <TextArea label="Where would you like your business to be 12 months from now?" name="twelveMonthVision" required />
        </FormSection>

        <FormSection number={4} title="Coaching readiness">
          <TextArea label="Why do you want to work with Taniesha Linton-Flemmings?" name="whyTaniesha" required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Have you worked with a business coach before?" name="workedWithCoach" required options={["Yes", "No"]} />
            <Select label="Will you complete agreed tasks between sessions?" name="willCompleteTasks" required options={["Yes", "No"]} />
            <Select label="Time you can dedicate each week" name="weeklyTime" required options={["Less than 2 hours", "2–5 hours", "5–10 hours", "10+ hours"]} />
            <Select label="How soon would you like to start?" name="startTimeline" required options={["Immediately", "Within 2 weeks", "Within a month", "Just exploring"]} />
          </div>
          <Select label="Will you provide honest information about your business's progress, income, and challenges where relevant?" name="honestInformation" required options={["Yes", "No"]} />
        </FormSection>

        <FormSection number={5} title="Business funding interest">
          <Select label="Would you like to be considered for business funding if an opportunity becomes available?" name="fundingInterest" required value={fundingInterest} onChange={setFundingInterest} options={["Yes", "No", "Maybe in the future"]} />
          {fundingInterest === "Yes" && (
            <div className="mt-6 space-y-5 border-l-2 border-gold-500/50 pl-5 sm:pl-7">
              <p className="rounded-xl bg-cream-100 p-4 text-sm leading-6 text-navy-800/75">
                <strong className="text-navy-950">Important:</strong> Expressing interest does not constitute an offer, approval, or guarantee of funding. Any opportunity is subject to a separate assessment, approval process, written agreement, and applicable terms.
              </p>
              <Field label="How much funding are you interested in? (JMD)" name="fundingAmount" required />
              <TextArea label="What would the money be used for?" name="fundingUse" required />
              <TextArea label="How would this funding help grow your business?" name="fundingGrowth" required />
              <Field label="Estimated return the investment would generate" name="estimatedReturn" required />
              <TextArea label="Expected source of repayment" name="repaymentSource" required />
              <Select label="Required repayment period" name="repaymentPeriod" required options={["1 month", "2 months", "3 months", "Other"]} />
              <Select label="Do you have other business loans or outstanding financing?" name="hasOtherFinancing" required options={["Yes", "No"]} />
              <TextArea label="If yes, briefly explain" name="otherFinancingDetails" />
            </div>
          )}
        </FormSection>

        <FormSection number={6} title="Declaration & consent">
          <p className="text-sm leading-6 text-navy-800/65">Please confirm each statement before sending your application.</p>
          <div className="mt-5 space-y-3">
            <Consent name="declarationAccepted">I confirm that the information provided is true and accurate to the best of my knowledge.</Consent>
            <Consent name="programmeAcknowledged">I understand that applying does not guarantee acceptance into the coaching programme.</Consent>
            <Consent name="resultsAcknowledged">I understand that business coaching does not guarantee specific business, income, sales, or financial results.</Consent>
            <Consent name="fundingAcknowledged">I understand that expressing interest in funding does not guarantee that funding will be offered or approved.</Consent>
            <Consent name="contactConsent">I consent to being contacted regarding my application.</Consent>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Applicant full name / electronic signature" name="electronicSignature" required />
            <Field label="Date" name="applicationDate" type="date" required />
          </div>
        </FormSection>

        <div className="rounded-2xl bg-navy-950 p-6 text-cream-50 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <p className="max-w-md text-sm leading-6 text-cream-100/70">Submitting does not guarantee programme acceptance or funding approval.</p>
          <button type="submit" disabled={status === "loading"} className="mt-4 w-full rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-cream-50 disabled:opacity-60 sm:mt-0 sm:w-auto">
            {status === "loading" ? "Sending application…" : "Send my application"}
          </button>
        </div>
        {status === "error" && message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
      </form>
    </div>
  );
}

function FormSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return <fieldset data-section={number - 1} className="rounded-[1.5rem] border border-navy-800/10 bg-white p-5 shadow-sm sm:p-8"><legend className="px-2 font-serif text-2xl font-semibold text-navy-950"><span className="mr-3 text-base text-gold-600">{number}</span>{title}</legend><div className="mt-3 space-y-5">{children}</div></fieldset>;
}

function Field({ label, name, type = "text", required, defaultValue, min }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; min?: string }) {
  return <label className="block text-sm font-medium text-navy-900">{label}{required && <span className="text-gold-600"> *</span>}<input name={name} type={type} required={required} defaultValue={defaultValue} min={min} className={inputClass} /></label>;
}

function Select({ label, name, options, required, value, onChange }: { label: string; name: string; options: string[]; required?: boolean; value?: string; onChange?: (value: string) => void }) {
  return <label className="block text-sm font-medium text-navy-900">{label}{required && <span className="text-gold-600"> *</span>}<select name={name} required={required} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} defaultValue={value === undefined ? "" : undefined} className={inputClass}><option value="">Select an option</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function TextArea({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-navy-900">{label}{required && <span className="text-gold-600"> *</span>}<textarea name={name} required={required} rows={4} className={inputClass} /></label>;
}

function CheckboxGroup({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
  return <fieldset><legend className="text-sm font-medium text-navy-900">{label}{required && <span className="text-gold-600"> *</span>}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => <label key={option} className="flex items-center gap-3 rounded-xl border border-navy-800/10 px-4 py-3 text-sm text-navy-800/75"><input type="checkbox" name={name} value={option} className="h-4 w-4 accent-gold-600" />{option}</label>)}</div></fieldset>;
}

function Consent({ name, children }: { name: string; children: React.ReactNode }) {
  return <label className="flex gap-3 rounded-xl bg-cream-100 px-4 py-3 text-sm leading-6 text-navy-800/80"><input type="checkbox" name={name} value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-gold-600" /><span>{children}<span className="text-gold-600"> *</span></span></label>;
}
