// expiries.js — usa fetch directo a Upstash con logs para diagnosticar

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

  const URL   = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!URL || !TOKEN) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ _error: 'not_configured', _detail: 'Faltan env vars UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN' }),
    };
  }

  const KEY = 'raiden_expiries_v2';

  if (event.httpMethod === 'GET') {
    try {
      const r = await fetch(`${URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const text = await r.text();
      let result = null;
      try { result = JSON.parse(text).result; } catch(e) {}
      const data = result ? JSON.parse(result) : {};
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ _error: e.message }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const r = await fetch(`${URL}/set/${KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(body)),
      });
      const text = await r.text();
      if (r.ok) {
        return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
      }
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: false, detail: text }) };
    } catch (e) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
};
