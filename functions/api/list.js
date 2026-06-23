function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const pin = url.searchParams.get('pin') || request.headers.get('x-manager-pin');
  if (env.MANAGER_PIN && pin !== env.MANAGER_PIN) return json({ ok:false, error:'Unauthorised' }, 401);
  if (!env.DB) return json({ ok:false, error:'D1 database binding DB is not configured' }, 500);
  const { results } = await env.DB.prepare(
    `SELECT id, submitted_at, site_name, engineer_name, plant_temp, risk_level, supervisor_notified, data_json
     FROM assessments ORDER BY submitted_at DESC LIMIT 500`
  ).all();
  return json({ ok:true, records: results.map(r => ({ ...r, data: JSON.parse(r.data_json || '{}') })) });
}
