CREATE TABLE "fairs" (
	"name" text PRIMARY KEY NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"name" text PRIMARY KEY NOT NULL,
	"gdp_cny" text NOT NULL,
	"rank" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"notice_date" text DEFAULT '' NOT NULL,
	"deadline" text DEFAULT '' NOT NULL,
	"url" text NOT NULL
);
