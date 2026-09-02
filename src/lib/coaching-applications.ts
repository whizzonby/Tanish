import type { CoachingApplicationStatus } from "@prisma/client";

export const coachingApplicationStatuses: CoachingApplicationStatus[] = [
  "NEW",
  "REVIEWING",
  "FOLLOW_UP",
  "ACCEPTED",
  "DECLINED",
];

export const coachingApplicationStatusLabels: Record<CoachingApplicationStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  FOLLOW_UP: "Follow up",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

export function isCoachingApplicationStatus(value: string): value is CoachingApplicationStatus {
  return coachingApplicationStatuses.includes(value as CoachingApplicationStatus);
}
