-- Isolated gateway accounting; run only in a dedicated or reviewed D1 database.
CREATE TABLE IF NOT EXISTS ai_gateway_usage (
  id TEXT PRIMARY KEY NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0 CHECK (uses >= 0),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ai_gateway_usage_updated_at ON ai_gateway_usage(updated_at);
