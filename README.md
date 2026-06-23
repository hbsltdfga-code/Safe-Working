# HBS Heat Stress Risk Assessment v6 - Cloudflare Pages.

This version is built for Cloudflare Pages and GitHub upload.

## Included

- `index.html` - engineer heat stress risk assessment form
- `dashboard.html` - manager dashboard
- `functions/api/submit.js` - saves submissions and sends email notifications
- `functions/api/list.js` - manager-only dashboard data API
- `schema.sql` - Cloudflare D1 database table
- `wrangler.toml` - Cloudflare D1 binding example

## Notification recipients

The Cloudflare function sends supervisor notifications to:

- lucy.coppage@hockley-ltd.com
- eward.richards@hockley-ltd.com
- peter.taylor@hockley-ltd.com

Emails are only sent when **Supervisor Notified = Yes**.

## GitHub upload structure

Upload the extracted folder contents to GitHub so the repository root contains:

```text
index.html
dashboard.html
schema.sql
wrangler.toml
_headers
functions/api/submit.js
functions/api/list.js
README.md
```

## Cloudflare Pages setup

1. Log in to Cloudflare.
2. Go to **Workers & Pages**.
3. Select **Create application**.
4. Select **Pages**.
5. Select **Connect to Git**.
6. Choose the GitHub repository.
7. Use these build settings:

```text
Framework preset: None
Build command: leave blank
Build output directory: /
```

8. Deploy.

## D1 database setup

In Cloudflare:

1. Go to **Workers & Pages** > **D1 SQL Database**.
2. Create a database called:

```text
hbs_heat_stress
```

3. Open the database console and run the contents of `schema.sql`.
4. Go to your Pages project > **Settings** > **Functions** > **D1 database bindings**.
5. Add a binding:

```text
Variable name: DB
Database: hbs_heat_stress
```

## Environment variables

Go to **Pages project** > **Settings** > **Environment variables** and add:

```text
MANAGER_PIN = choose-your-manager-pin
RESEND_API_KEY = your-resend-api-key
FROM_EMAIL = HBS Compliance <verified@yourdomain.co.uk>
```

`MANAGER_PIN` protects the dashboard.

`RESEND_API_KEY` is required for email notifications. Without it, the form still saves to D1, but emails are skipped.

## Resend email setup

1. Create a free Resend account.
2. Verify your sending domain or use the temporary Resend onboarding sender while testing.
3. Create an API key.
4. Add the API key to Cloudflare Pages as `RESEND_API_KEY`.
5. Redeploy the Pages project.

## Testing

1. Open the Cloudflare Pages URL.
2. Submit a test assessment.
3. Open `/dashboard.html`.
4. Enter the manager PIN.
5. Confirm the record appears.
6. Test Supervisor Notified = Yes to confirm emails are sent.
