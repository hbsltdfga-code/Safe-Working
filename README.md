# HBS Heat Stress Risk Assessment v7 - Cloudflare Pages

This version is designed to work without email notification. Assessments are saved into Cloudflare D1 and reviewed through the manager dashboard.

## Included

- `index.html` - engineer heat stress risk assessment form
- `dashboard.html` - manager dashboard with statistics, filters, high-risk highlighting, CSV export and print/PDF support
- `functions/api/submit.js` - saves submissions to D1; email is optional and cannot block saving
- `functions/api/list.js` - manager-only dashboard API
- `schema.sql` - Cloudflare D1 database table
- `wrangler.toml` - Cloudflare Pages D1 binding example

## Required Cloudflare settings

### D1 binding

Pages project > Settings > Bindings:

- Type: D1 database
- Binding name: `DB`
- Database: `hbs_heat_stress`

### Required variable

Pages project > Settings > Variables and secrets:

- `MANAGER_PIN` = your chosen dashboard PIN

## Optional email variables

Email notifications are optional. If these are missing or Resend rejects the sender, the form still saves successfully.

- `EMAIL_TO` = `lucy.coppage@hockley-ltd.com,eward.richards@hockley-ltd.com,peter.taylor@hockley-ltd.com`
- `RESEND_API_KEY` = your Resend API key
- `FROM_EMAIL` = verified sender address in Resend

## D1 schema

Run this in Cloudflare D1 Console:

```sql
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
```

## Testing

1. Open the Pages URL.
2. Submit a test assessment.
3. Confirm the success message shows a reference number.
4. Open `/dashboard.html`.
5. Enter `MANAGER_PIN`.
6. Confirm the record appears.
7. Use filters, CSV export, and Print / Save PDF as required.
