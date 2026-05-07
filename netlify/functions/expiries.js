const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const KEY = 'raiden_expiries_v4';

  if (!REDIS_URL || !REDIS_TOKEN) {
    return { statusCode: 200, headers: HEADERS,
      body: JSON.stringify({ _error: 'not_configured' }) };
  }

  // GET
  if (event.httpMethod === 'GET') {
    try {
      const r    = await fetch(`${REDIS_URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      });
      const json = await r.json();
      const data = json.result ? JSON.parse(json.result) : {};
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    } catch(e) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({}) };
    }
  }

  // POST
  if (event.httpMethod === 'POST') {
    try {
      const data   = JSON.parse(event.body || '{}');
      const value  = JSON.stringify(data);
      // Upstash REST /set/KEY: el body es el valor directamente como texto plano
      const r = await fetch(`${REDIS_URL}/set/${KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REDIS_TOKEN}`,
          'Content-Type': 'text/plain',
        },
        body: value
      });
      const json = await r.json();
      const ok   = json.result === 'OK';
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok }) };
    } catch(e) {
      return { statusCode: 500, headers: HEADERS,
        body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
};
