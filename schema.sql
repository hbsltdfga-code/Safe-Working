CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  site_name TEXT,
  engineer_name TEXT,
  plant_temp TEXT,
  risk_level TEXT,
  supervisor_notified TEXT,
  data_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessments_submitted_at ON assessments(submitted_at);
CREATE INDEX IF NOT EXISTS idx_assessments_engineer ON assessments(engineer_name);
CREATE INDEX IF NOT EXISTS idx_assessments_site ON assessments(site_name);
CREATE INDEX IF NOT EXISTS idx_assessments_risk ON assessments(risk_level);
