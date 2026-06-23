
export async function onRequestPost(context) {
  try {
    const env = context.env || {};
    const data = await context.request.json();

    const reference = `HBS-HEAT-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
    data.reference = reference;
    data.serverReceivedAt = new Date().toISOString();

    // Optional Cloudflare KV storage. Create a KV namespace and bind it as ASSESSMENTS.
    if (env.ASSESSMENTS) {
      await env.ASSESSMENTS.put(reference, JSON.stringify(data, null, 2));
    }

    // Optional email using Resend. Add RESEND_API_KEY and FROM_EMAIL environment variables.
    const recipients = [
      'lucy.coppage@hockley-ltd.com',
      'eward.richards@hockley-ltd.com',
      'pqctkpdxj5@privaterelay.appleid.com'
    ];

    let emailSent = false;
    if (env.RESEND_API_KEY) {
      const subjectPrefix = data.notifySupervisorEmails === 'Yes' ? 'SUPERVISOR NOTIFIED - ' : '';
      const subject = `${subjectPrefix}HBS Heat Stress Risk Assessment - ${data.siteName || 'Site'} - ${reference}`;
      const text = buildEmailText(data);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL || 'HBS Compliance <onboarding@resend.dev>',
          to: recipients,
          subject,
          text
        })
      });

      if (!emailResponse.ok) {
        const detail = await emailResponse.text();
        console.error('Resend email failed', detail);
      } else {
        emailSent = true;
      }
    }

    return json({ ok: true, reference, saved: !!env.ASSESSMENTS, emailSent });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: err.message || 'Server error' }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, message: 'HBS Heat Stress Risk Assessment API is running.' });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function buildEmailText(d) {
  return `HBS Heat Stress Risk Assessment

Reference: ${d.reference}
Submitted: ${d.serverReceivedAt}

Site: ${d.siteName || ''}
Address: ${d.siteAddress || ''}
Plant room: ${d.plantRoomLocation || ''}
Engineer: ${d.engineerName || ''}
Engineer email: ${d.engineerEmail || ''}
Job reference: ${d.jobRef || ''}

Plant room temperature: ${d.plantTemp || ''} °C
Risk level: ${d.riskLevel || ''}
Risk recommendation: ${d.riskRecommendation || ''}
Supervisor notified: ${d.supervisorNotified || ''}
Supervisor name: ${d.supervisorName || ''}
Decision: ${d.decision || ''}

Hydration plan:
Water carried: ${d.waterCarried || ''}
Water before entry: ${d.waterBeforeEntry || ''}
Break frequency: ${d.plannedBreakFrequency || ''}
Cooling area identified: ${d.coolingAreaIdentified || ''}
Additional water available: ${d.additionalWaterAvailable || ''}
Welfare check frequency: ${d.welfareCheckFrequency || ''}

Additional controls:
${d.additionalControls || ''}

Completion:
Work completed: ${d.workCompleted || ''}
Time finished: ${d.timeFinished || ''}
Max temperature: ${d.maxTemp || ''}
Hydration breaks taken: ${d.hydrationBreaksTaken || ''}
Water consumed: ${d.waterConsumedDuringWork || ''}
Incident reported: ${d.incidentReported || ''}
Follow-up required: ${d.followUpRequired || ''}

Break / welfare notes:
${d.breakWelfareNotes || ''}

Supervisor comments:
${d.supervisorComments || ''}

Engineer declaration/signature:
${d.engineerSignature || ''}
`;
}
