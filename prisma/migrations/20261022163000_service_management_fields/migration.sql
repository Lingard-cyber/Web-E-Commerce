CREATE TYPE "ServiceBookingMode" AS ENUM ('direct_booking', 'quotation');

ALTER TABLE "Product"
ADD COLUMN "serviceBookingMode" "ServiceBookingMode",
ADD COLUMN "serviceRequirements" TEXT,
ADD COLUMN "serviceAvailability" TEXT,
ADD COLUMN "serviceDuration" TEXT;
