CREATE TABLE messages
(
    id             TEXT PRIMARY KEY,
    author_id      TEXT NOT NULL,
    content        TEXT,
    attachment_b64 TEXT,
    ts             TIMESTAMPTZ
);
