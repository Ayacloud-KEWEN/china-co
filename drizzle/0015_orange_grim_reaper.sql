ALTER TABLE "divisions" ADD COLUMN "website" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "postcode" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "dial_code" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "geo" jsonb;--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "summary_source" text DEFAULT '' NOT NULL;