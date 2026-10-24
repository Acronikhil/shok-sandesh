-- Accounts: one per mobile number.
CREATE TABLE users (
  id            INTEGER PRIMARY KEY,
  mobile        TEXT    NOT NULL UNIQUE,         -- 10-digit Indian mobile
  name          TEXT    NOT NULL,
  pass_hash     TEXT    NOT NULL,                -- hex SHA-256(salt || client PBKDF2 key)
  pass_salt     TEXT    NOT NULL,                -- hex, per user
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until  INTEGER NOT NULL DEFAULT 0,      -- unix ms
  created_at    INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT    PRIMARY KEY,                -- hex SHA-256 of the cookie value
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL                    -- unix ms
);
CREATE INDEX sessions_user ON sessions(user_id);

-- One शोक संदेश page. All editable content lives in `data` (JSON), see src/server/content.js.
CREATE TABLE posts (
  id         INTEGER PRIMARY KEY,
  slug       TEXT    NOT NULL UNIQUE,            -- public link: /s/<slug>
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT    NOT NULL,
  expires_on TEXT    NOT NULL,                   -- YYYY-MM-DD (IST); page is deleted once this day is over
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX posts_user ON posts(user_id);
CREATE INDEX posts_expiry ON posts(expires_on);

-- The photograph, resized in the browser (≈800px, webp/jpeg) before upload.
CREATE TABLE photos (
  post_id INTEGER PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  mime    TEXT    NOT NULL,
  bytes   BLOB    NOT NULL,
  version INTEGER NOT NULL                       -- cache-buster for the photo URL
);
