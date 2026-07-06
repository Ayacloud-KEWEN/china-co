ALTER TABLE "companies" ADD COLUMN "price_history" jsonb;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "ownership" jsonb;--> statement-breakpoint
ALTER TABLE "indicators" ADD COLUMN "series" jsonb;