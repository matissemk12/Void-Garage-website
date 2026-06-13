module.exports = async function handler(req, res) {
  const { key, days = '30' } = req.query;

  if (key !== process.env.ANALYTICS_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const d = Math.min(parseInt(days) || 30, 180);
  const SUPA = process.env.SUPABASE_URL;
  const KEY  = process.env.SUPABASE_SERVICE_KEY;

  const since     = new Date(Date.now() - d * 86400000).toISOString();
  const prevSince = new Date(Date.now() - d * 2 * 86400000).toISOString();

  const h = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const [r1, r2, r3, r4] = await Promise.all([
      fetch(`${SUPA}/rest/v1/visits?created_at=gte.${since}&select=id,created_at,source,referrer,is_mobile&order=created_at.asc`, { headers: h }),
      fetch(`${SUPA}/rest/v1/events?created_at=gte.${since}&event_name=eq.book_click&select=id,created_at&order=created_at.asc`, { headers: h }),
      fetch(`${SUPA}/rest/v1/visits?created_at=gte.${prevSince}&created_at=lt.${since}&select=id&order=created_at.asc`, { headers: h }),
      fetch(`${SUPA}/rest/v1/events?created_at=gte.${prevSince}&created_at=lt.${since}&event_name=eq.book_click&select=id&order=created_at.asc`, { headers: h }),
    ]);

    const [visits, events, prevVisits, prevEvents] = await Promise.all([
      r1.json(), r2.json(), r3.json(), r4.json(),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    res.json({ visits, events, prevVisits, prevEvents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};
