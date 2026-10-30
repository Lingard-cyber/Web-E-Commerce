CREATE TABLE "password_reset_challenges" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "authUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "password_reset_challenges_email_createdAt_idx" ON "password_reset_challenges"("email", "createdAt");
CREATE INDEX "password_reset_challenges_expiresAt_idx" ON "password_reset_challenges"("expiresAt");
