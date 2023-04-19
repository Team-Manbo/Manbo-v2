\connect manbo

CREATE TABLE IF NOT EXISTS guilds
(
    id               VARCHAR(21) PRIMARY KEY,
    owner_id         VARCHAR(21) NOT NULL,
    ignored_channels VARCHAR(21)[],
    disabled_events  TEXT[],
    event_logs       JSON,
    log_bots         BOOL,
    custom_settings  JSON
);

CREATE TABLE IF NOT EXISTS messages
(
    id             VARCHAR(21) PRIMARY KEY,
    author_id      VARCHAR(21) NOT NULL,
    content        TEXT,
    attachment_b64 TEXT,
    ts             TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS remindme
(
    guild_id VARCHAR(21),
    message_id VARCHAR(21),
    channel_id VARCHAR(21),
    content TEXT
);

CREATE TABLE IF NOT EXISTS settings
(
    id VARCHAR(21) PRIMARY KEY,
    language TEXT,
    prefix VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS topgg
(
    id VARCHAR(21) PRIMARY KEY,
    timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS economy
(
    user_id VARCHAR(21),
    guild_id VARCHAR(21)[],
    coin TEXT,
    percentage NUMERIC(5, 2),
    daily TIMESTAMPTZ,
    topgg TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS starboard
(
    guild_id VARCHAR(21) PRIMARY KEY,
    channel_id VARCHAR(21),
    minimum INTEGER,
    emoji_name VARCHAR(32),
    emoji_id VARCHAR(21),
    locked BOOLEAN,
    ids JSONB
);