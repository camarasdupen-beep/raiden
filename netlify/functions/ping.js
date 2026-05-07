// ping.js — diagnóstico de conexión con Upstash
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async () => {
  const URL   = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!URL || !TOKEN) {
    return {
      statusCode: 200, headers: HEADERS,
      body: JSON.stringify({ ok: false, error: 'Env vars no configuradas', URL: !!URL, TOKEN: !!TOKEN }),
    };
  }

  try {
    const r    = await fetch(`${URL}/ping`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const text = await r.text();
    return {
      statusCode: 200, headers: HEADERS,
      body: JSON.stringify({ ok: r.ok, status: r.status, response: text, url_prefix: URL.substring(0, 30) }),
    };
  } catch (e) {
    return {
      statusCode: 200, headers: HEADERS,
      body: JSON.stringify({ ok: false, error: e.message }),
    };
  }
};
