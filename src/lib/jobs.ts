import type {
  ApplicationStatus,
  EmploymentType,
  JobStatus,
} from "@prisma/client";

export const employmentTypes: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "TEMPORARY",
];

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
};

export const jobStatuses: JobStatus[] = ["DRAFT", "OPEN", "CLOSED"];

export const applicationStatuses: ApplicationStatus[] = [
  "NEW",
  "REVIEWING",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Not moving forward",
};

export function slugifyJob(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Parse a textarea where each non-empty line is one list item. */
export function parseLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}
