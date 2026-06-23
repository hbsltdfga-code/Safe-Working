
# HBS Heat Stress Risk Assessment - Cloudflare Pages Version

This version removes Netlify Forms and submits to a Cloudflare Pages Function at `/api/submit`.

## Upload using GitHub + Cloudflare Pages

1. Create a new GitHub repository.
2. Upload all files/folders from this package, including:
   - `index.html`
   - `functions/api/submit.js`
3. In Cloudflare Pages, connect the GitHub repository.
4. Use these build settings:
   - Framework preset: None
   - Build command: leave blank
   - Build output directory: `/`
5. Deploy.

## Test

Open:

`https://your-cloudflare-site.pages.dev/api/submit`

You should see:

`{"ok":true,"message":"HBS Heat Stress Risk Assessment API is running."}`

Then submit a test assessment from the form.

## Optional saving of submissions

To save submissions in Cloudflare KV:

1. Cloudflare dashboard > Workers & Pages > KV.
2. Create a KV namespace, for example `hbs_heat_assessments`.
3. Open your Pages project > Settings > Functions > KV namespace bindings.
4. Add binding:
   - Variable name: `ASSESSMENTS`
   - KV namespace: your created namespace
5. Redeploy.

## Optional email notifications

This function supports Resend email.

1. Create a Resend account.
2. Add and verify your sending domain, or use Resend's test sender while testing.
3. Cloudflare Pages > Settings > Environment variables.
4. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `FROM_EMAIL` = for example `HBS Compliance <compliance@yourdomain.co.uk>`
5. Redeploy.

Emails are sent to:

- lucy.coppage@hockley-ltd.com
- eward.richards@hockley-ltd.com
- pqctkpdxj5@privaterelay.appleid.com

## Notes

The form still includes Print / Save PDF and Download JSON buttons as a backup.
