const DEFAULT_RECIPIENTS = [
  'lucy.coppage@hockley-ltd.com',
  'eward.richards@hockley-ltd.com',
  'peter.taylor@hockley-ltd.com'
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function recordReference() {
  const d = new Date();
  const stamp = d.toISOString().slice(0,10).replaceAll('-', '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HBS-${stamp}-${rand}`;
}

function recipients(env) {
  const raw = env.EMAIL_TO || DEFAULT_RECIPIENTS.join(',');
  return raw.split(',').map(x => x.trim()).filter(Boolean);
}

function buildEmailHtml(data, recordId) {
  const rows = [
    ['Record Reference', recordId],
    ['Site', data.siteName],
    ['Address', data.siteAddress],
    ['Plant room', data.plantRoomLocation],
    ['Engineer', data.engineerName],
    ['Engineer email', data.engineerEmail],
    ['Date', data.assessmentDate],
    ['Plant room temp', data.plantTemp ? `${data.plantTemp} °C` : ''],
    ['Risk level', data.riskLevel],
    ['Recommendation', data.riskRecommendation],
    ['Decision', data.decision],
    ['Supervisor notified', data.supervisorNotified],
    ['Supervisor', data.supervisorName],
    ['Hydration breaks taken', data.hydrationBreaksTaken],
    ['Submitted at', data.submittedAt]
  ];
  return `<h2>HBS Heat Stress Risk Assessment Submitted</h2>
  <p>A heat stress risk assessment has been submitted.</p>
  <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial;font-size:14px">
  ${rows.map(([k,v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
  </table>
  <h3>Additional Controls</h3><p>${esc(data.additionalControls)}</p>
  <h3>Break / Welfare Notes</h3><p>${esc(data.breakWelfareNotes)}</p>`;
}

async function sendEmail(env, data, recordId) {
  if (!env.RESEND_API_KEY) return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  if (!env.FROM_EMAIL) return { skipped: true, reason: 'FROM_EMAIL not configured' };

  const subject = `HBS Heat Stress Assessment ${recordId} - ${data.siteName || 'Site'} - ${data.riskLevel || 'Risk'}`;
  const html = buildEmailHtml(data, recordId);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: recipients(env),
      subject,
      html
    })
  });
  const body = await res.text();
  if (!res.ok) return { skipped: true, reason: `Resend rejected email: ${res.status} ${body}` };
  return { sent: true };
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    data.submittedAt = data.submittedAt || new Date().toISOString();
    const recordId = data.recordId || recordReference();
    data.recordId = recordId;

    if (!env.DB) return json({ ok: false, error: 'D1 database binding DB is not configured' }, 500);

    await env.DB.prepare(
      `INSERT INTO assessments (id, submitted_at, site_name, engineer_name, plant_temp, risk_level, supervisor_notified, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      recordId,
      data.submittedAt,
      data.siteName || '',
      data.engineerName || '',
      data.plantTemp || '',
      data.riskLevel || '',
      data.supervisorNotified || '',
      JSON.stringify(data)
    ).run();

    let email = { skipped: true, reason: 'Email notification disabled or supervisor not notified' };
    if (String(data.supervisorNotified).toLowerCase() === 'yes') {
      // Email must never block successful form saving.
      email = await sendEmail(env, data, recordId).catch(err => ({ skipped: true, reason: err.message }));
    }

    return json({ ok: true, id: recordId, recordId, email });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
