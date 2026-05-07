const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async () => {
  const URL   = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const KEY   = 'raiden_expiries_v2';

  if (!URL || !TOKEN) {
    return { statusCode: 200, headers: HEADERS,
      body: JSON.stringify({ error: 'env vars faltantes' }) };
  }

  const results = {};

  // 1. PING
  try {
    const r = await fetch(`${URL}/ping`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    results.ping = await r.text();
  } catch(e) { results.ping = 'ERROR: ' + e.message; }

  // 2. SET de prueba
  try {
    const r = await fetch(`${URL}/set/${KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify({ _test: true, ts: Date.now() }))
    });
    results.set_status = r.status;
    results.set_body = await r.text();
  } catch(e) { results.set = 'ERROR: ' + e.message; }

  // 3. GET para confirmar
  try {
    const r = await fetch(`${URL}/get/${KEY}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    results.get_status = r.status;
    results.get_body = await r.text();
  } catch(e) { results.get = 'ERROR: ' + e.message; }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(results, null, 2) };
};
