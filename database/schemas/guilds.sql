CREATE TABLE guilds
(
    id               TEXT PRIMARY KEY,
    owner_id         TEXT NOT NULL,
    ignored_channels TEXT[],
    disabled_events  TEXT[],
    event_logs       JSON,
    log_bots         BOOL,
    custom_settings  JSON
);
