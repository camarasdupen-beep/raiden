const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

exports.handler = async () => {
  const URL   = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const KEY   = 'raiden_expiries_v3';
  if (!URL || !TOKEN) return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ error: 'env vars faltantes' }) };

  const results = {};

  // SET usando pipeline (formato correcto)
  try {
    const testData = { _test: true, ts: Date.now() };
    const r = await fetch(`${URL}/set/${KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', KEY, JSON.stringify(testData)])
    });
    results.set = await r.json();
  } catch(e) { results.set = 'ERROR: ' + e.message; }

  // GET
  try {
    const r = await fetch(`${URL}/get/${KEY}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const j = await r.json();
    results.get_raw = j;
    results.get_parsed = j.result ? JSON.parse(j.result) : null;
  } catch(e) { results.get = 'ERROR: ' + e.message; }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(results, null, 2) };
};
