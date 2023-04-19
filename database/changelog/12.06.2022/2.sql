ALTER TABLE economy
RENAME COLUMN guild_id to guild_ids;

-- should update guild_ids value to ARRAY before running the query below

ALTER TABLE economy
ALTER COLUMN guild_ids TYPE VARCHAR(21)[] USING guild_ids::character varying(21)[];