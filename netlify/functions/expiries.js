// netlify/functions/expiries.js
// Base de datos de vencimientos compartida entre los 3 celulares
// Usa Netlify Blobs (storage gratuito incluido en Netlify)

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

  try {
    // Intentar usar Netlify Blobs
    const store = getStore({ name: 'vencimientos', consistency: 'strong' });

    if (event.httpMethod === 'GET') {
      let data = {};
      try {
        const raw = await store.get('expiries');
        if (raw) data = JSON.parse(raw);
      } catch (e) { data = {}; }
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      await store.set('expiries', JSON.stringify(body));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

  } catch (blobError) {
    // Fallback: si Blobs no está disponible, retornar datos vacíos con info
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ _error: 'blob_unavailable', _msg: 'Activá Netlify Blobs en el panel' }),
      };
    }
    if (event.httpMethod === 'POST') {
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ ok: false, error: 'Netlify Blobs no disponible: ' + blobError.message }),
      };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
};
