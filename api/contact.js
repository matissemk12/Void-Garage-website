function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, contact, message } = req.body || {};
  if (!name || !contact) return res.status(400).json({ error: 'Missing required fields' });

  const RESEND = process.env.RESEND_API_KEY;
  if (!RESEND) return res.status(500).json({ error: 'No email config' });

  const TO = process.env.CONTACT_TO || process.env.DIGEST_TO || 'matissemk12@gmail.com';

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Void Hiring <onboarding@resend.dev>',
      to: [TO],
      subject: `New Job Application — ${esc(name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;padding:32px;background:#09090b;color:#fafafa;border-radius:12px">
          <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#71717a;margin:0 0 24px">Void Garage Cleaning — Job Application</p>
          <h2 style="margin:0 0 24px;font-size:22px">${esc(name)}</h2>
          <p style="margin:0 0 8px;color:#71717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Contact</p>
          <p style="margin:0 0 24px">${esc(contact)}</p>
          <p style="margin:0 0 8px;color:#71717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Message</p>
          <p style="margin:0;white-space:pre-wrap">${esc(message || '—')}</p>
        </div>
      `,
    }),
  });

  const result = await r.json();
  if (!r.ok) return res.status(500).json({ error: result });
  res.json({ ok: true });
};
