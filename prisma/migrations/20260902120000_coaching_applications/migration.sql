-- CreateTable
CREATE TYPE "CoachingApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'FOLLOW_UP', 'ACCEPTED', 'DECLINED');

CREATE TABLE "CoachingApplication" (
    "id" TEXT NOT NULL,
    "fullLegalName" TEXT NOT NULL,
    "preferredName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "parishCity" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "ageRange" TEXT,
    "preferredContactMethod" TEXT,
    "businessName" TEXT,
    "businessDetails" JSONB NOT NULL,
    "goalsAndSupport" JSONB NOT NULL,
    "coachingReadiness" JSONB NOT NULL,
    "fundingInterest" TEXT NOT NULL,
    "fundingDetails" JSONB,
    "declarationAccepted" BOOLEAN NOT NULL,
    "programmeAcknowledged" BOOLEAN NOT NULL,
    "resultsAcknowledged" BOOLEAN NOT NULL,
    "fundingAcknowledged" BOOLEAN NOT NULL,
    "contactConsent" BOOLEAN NOT NULL,
    "electronicSignature" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "status" "CoachingApplicationStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingApplication_status_createdAt_idx" ON "CoachingApplication"("status", "createdAt");
