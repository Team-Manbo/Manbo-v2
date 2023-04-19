ALTER TABLE guilds
ALTER COLUMN id TYPE VARCHAR(21),
ALTER COLUMN owner_id TYPE VARCHAR(21),
ALTER COLUMN ignored_channels TYPE VARCHAR(21)[];

ALTER TABLE messages
ALTER COLUMN id TYPE VARCHAR(21),
ALTER COLUMN author_id TYPE VARCHAR(21);

ALTER TABLE remindme
ALTER COLUMN guild_id TYPE VARCHAR(21),
ALTER COLUMN message_id TYPE VARCHAR(21),
ALTER COLUMN channel_id TYPE VARCHAR(21);

ALTER TABLE settings
ALTER COLUMN id TYPE VARCHAR(21);

ALTER TABLE topgg
ALTER COLUMN id TYPE VARCHAR(21);

CREATE TABLE IF NOT EXISTS economy
(
    user_id VARCHAR(21),
    guild_id VARCHAR(21),
    coin TEXT,
    percentage NUMERIC(5, 2),
    daily TIMESTAMPTZ,
    topgg TIMESTAMPTZ
);