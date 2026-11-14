-- Dedicated AI Gateway D1 only. Do not migrate existing WorldToon production DB without review.
CREATE TABLE IF NOT EXISTS ai_gateway_permissions (
 user_id TEXT NOT NULL,
 app_id TEXT NOT NULL,
 project_id TEXT NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
 PRIMARY KEY (user_id,app_id,project_id)
);
CREATE INDEX IF NOT EXISTS ai_gateway_permissions_app ON ai_gateway_permissions(app_id,project_id);
