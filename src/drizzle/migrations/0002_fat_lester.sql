CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "role" "role" DEFAULT 'user';