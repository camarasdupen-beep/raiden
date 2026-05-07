// netlify/functions/expiries.js
// Almacenamiento compartido usando Netlify Blobs (gratuito, sin configuración extra)

const { getStore } = require('@netlify/blobs');

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

  const store = getStore({ name: 'vencimientos', consistency: 'strong' });

  // ── GET: leer vencimientos ──────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get('expiries');
      const data = raw ? JSON.parse(raw) : {};
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({}) };
    }
  }

  // ── POST: guardar vencimientos ──────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      await store.set('expiries', JSON.stringify(body));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: e.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
};
