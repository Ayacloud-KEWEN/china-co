CREATE TABLE "cities" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"gdp" text NOT NULL,
	"pop" text NOT NULL,
	"pillars" jsonb NOT NULL,
	"leaders" jsonb NOT NULL,
	"summary" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"industry" text NOT NULL,
	"city" text NOT NULL,
	"founded" integer NOT NULL,
	"employees" text NOT NULL,
	"revenue" text NOT NULL,
	"listed" text NOT NULL,
	"logo" text NOT NULL,
	"tags" jsonb NOT NULL,
	"overview" jsonb NOT NULL,
	"export_markets" jsonb NOT NULL,
	"products" jsonb NOT NULL,
	"competitors" jsonb NOT NULL,
	"risk_score" integer NOT NULL,
	"growth" integer NOT NULL,
	"sources" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" jsonb NOT NULL,
	"value" text NOT NULL,
	"trend" text NOT NULL,
	"up" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"icon" text NOT NULL,
	"market_size" text NOT NULL,
	"growth" integer NOT NULL,
	"leaders" jsonb NOT NULL,
	"cities" jsonb NOT NULL,
	"summary" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" jsonb NOT NULL,
	"source" text NOT NULL,
	"time" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playbooks" (
	"slug" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" jsonb NOT NULL,
	"time" text NOT NULL,
	"cost" text NOT NULL,
	"difficulty" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"slug" text PRIMARY KEY NOT NULL,
	"org" text NOT NULL,
	"date" text NOT NULL,
	"impact" text NOT NULL,
	"title" jsonb NOT NULL,
	"tags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"city" text NOT NULL,
	"products" jsonb NOT NULL,
	"capacity" text NOT NULL,
	"certs" jsonb NOT NULL,
	"risk_score" integer NOT NULL,
	"export_markets" jsonb NOT NULL
);
