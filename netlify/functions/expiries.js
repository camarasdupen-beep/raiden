// netlify/functions/expiries.js
// Storage compartido usando Upstash Redis (free tier, sin dependencias npm)
// Si no está configurado, devuelve vacío sin romper la app.

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'raiden_expiries';

async function redisGet() {
  const r = await fetch(`${UPSTASH_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const d = await r.json();
  return d.result ? JSON.parse(d.result) : {};
}

async function redisSet(data) {
  await fetch(`${UPSTASH_URL}/set/${KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(data)),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  // Si no está configurado Upstash, devolvemos vacío sin error
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ _error: 'not_configured' }),
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const data = await redisGet();
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({}) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      await redisSet(body);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
};
