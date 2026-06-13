module.exports = async function handler(req, res) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // We reuse ANALYTICS_KEY as the cron secret for simplicity
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.ANALYTICS_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPA   = process.env.SUPABASE_URL;
  const SKEY   = process.env.SUPABASE_SERVICE_KEY;
  const RESEND = process.env.RESEND_API_KEY;
  const TO     = process.env.DIGEST_TO || 'matissemk12@gmail.com';
  const DASH   = process.env.SITE_URL  || 'https://void-garage-website.vercel.app';

  const h = { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json' };

  const now      = new Date();
  const weekAgo  = new Date(now - 7  * 86400000).toISOString();
  const twoWeeks = new Date(now - 14 * 86400000).toISOString();

  const [r1, r2, r3, r4] = await Promise.all([
    fetch(`${SUPA}/rest/v1/visits?created_at=gte.${weekAgo}&select=id,source,is_mobile`, { headers: h }),
    fetch(`${SUPA}/rest/v1/events?created_at=gte.${weekAgo}&event_name=eq.book_click&select=id`, { headers: h }),
    fetch(`${SUPA}/rest/v1/visits?created_at=gte.${twoWeeks}&created_at=lt.${weekAgo}&select=id,source`, { headers: h }),
    fetch(`${SUPA}/rest/v1/events?created_at=gte.${twoWeeks}&created_at=lt.${weekAgo}&event_name=eq.book_click&select=id`, { headers: h }),
  ]);

  const [visits, clicks, prevVisits, prevClicks] = await Promise.all([
    r1.json(), r2.json(), r3.json(), r4.json(),
  ]);

  // Stats
  const tv = visits.length, tc = clicks.length;
  const pv = prevVisits.length, pc = prevClicks.length;
  const conv     = tv > 0 ? (tc / tv * 100).toFixed(1) : '0.0';
  const prevConv = pv > 0 ? (pc / pv * 100).toFixed(1) : '0.0';

  const vDelta = pv > 0 ? Math.round((tv - pv) / pv * 100) : null;
  const cDelta = pc > 0 ? Math.round((tc - pc) / pc * 100) : null;
  const rDelta = pv > 0 ? (parseFloat(conv) - parseFloat(prevConv)).toFixed(1) : null;

  // Top source
  const sm = {};
  visits.forEach(r => { const s = r.source || 'direct'; sm[s] = (sm[s]||0)+1; });
  const topSource = Object.entries(sm).sort((a,b)=>b[1]-a[1])[0];
  const topSrcLabel = topSource ? capitalize(topSource[0]) : '—';
  const topSrcPct   = topSource && tv > 0 ? Math.round(topSource[1]/tv*100) : 0;

  // Date range label
  const fmt = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const weekStart = new Date(now - 6 * 86400000);
  const dateRange = `${fmt(weekStart)} – ${fmt(now)}`;

  function delta(val, suf='%') {
    if (val === null) return `<span style="color:#71717a">—</span>`;
    const up = val >= 0;
    return `<span style="color:${up?'#22c55e':'#f87171'}">${up?'↑':'↓'} ${Math.abs(val)}${suf}</span>`;
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Void — Weekly Report</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh">
    <tr><td align="center" style="padding:48px 16px">

      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;border-bottom:1px solid #27272a">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#fafafa">◼ VOID</td>
              <td align="right" style="font-size:11px;color:#52525b;letter-spacing:.04em">${dateRange}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding:28px 0 24px">
          <div style="font-size:22px;font-weight:700;color:#fafafa;letter-spacing:-.02em">Weekly Report</div>
          <div style="font-size:13px;color:#71717a;margin-top:4px">Void Garage Cleaning — last 7 days</div>
        </td></tr>

        <!-- Stat grid -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden">
          <table width="100%" cellpadding="0" cellspacing="0">

            <tr>
              <td width="50%" style="padding:22px 24px;border-right:1px solid #27272a;border-bottom:1px solid #27272a">
                <div style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:8px">Visitors</div>
                <div style="font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-.02em;line-height:1;margin-bottom:8px">${tv.toLocaleString()}</div>
                <div style="font-size:12px">${delta(vDelta)} <span style="color:#52525b">vs prior week</span></div>
              </td>
              <td width="50%" style="padding:22px 24px;border-bottom:1px solid #27272a">
                <div style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:8px">Book Clicks</div>
                <div style="font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-.02em;line-height:1;margin-bottom:8px">${tc.toLocaleString()}</div>
                <div style="font-size:12px">${delta(cDelta)} <span style="color:#52525b">vs prior week</span></div>
              </td>
            </tr>

            <tr>
              <td width="50%" style="padding:22px 24px;border-right:1px solid #27272a">
                <div style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:8px">Conversion Rate</div>
                <div style="font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-.02em;line-height:1;margin-bottom:8px">${conv}%</div>
                <div style="font-size:12px">${delta(rDelta, 'pt')} <span style="color:#52525b">vs prior week</span></div>
              </td>
              <td width="50%" style="padding:22px 24px">
                <div style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:8px">Top Source</div>
                <div style="font-size:34px;font-weight:700;color:#fafafa;letter-spacing:-.02em;line-height:1;margin-bottom:8px">${topSrcLabel}</div>
                <div style="font-size:12px;color:#52525b">${topSrcPct}% of traffic</div>
              </td>
            </tr>

          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:28px 0 0">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <a href="${DASH}/analytics.html?key=void2024"
                   style="display:inline-block;background:#fff;color:#000;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;padding:13px 24px;border-radius:8px">
                  View Full Dashboard
                </a>
              </td>
              <td align="right" style="font-size:11px;color:#3f3f46">
                Void Analytics · auto-sent every Monday
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Void Analytics <onboarding@resend.dev>',
      to: [TO],
      subject: `Weekly Report · ${dateRange} · Void Garage Cleaning`,
      html,
    }),
  });

  const result = await emailRes.json();
  if (!emailRes.ok) return res.status(500).json({ error: result });
  res.json({ ok: true, id: result.id, stats: { tv, tc, conv } });
};
