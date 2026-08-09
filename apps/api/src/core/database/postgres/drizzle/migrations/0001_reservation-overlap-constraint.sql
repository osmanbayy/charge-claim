-- Custom SQL migration file, put your code below! --
-- add btree_gist extensions to database
CREATE EXTENSION IF NOT EXISTS "btree_gist";--> statement-breakpoint

-- add exclusion constraint
ALTER TABLE "public"."reservations"
ADD CONSTRAINT "reservations_connector_time_exclusion"
EXCLUDE USING gist (
  "connector_id" WITH =,
  tstzrange("start_at", "end_at", '[)') WITH &&
)
WHERE ("status" IN ('CONFIRMED', 'IN_PROGRESS'));