// netlify/functions/loyverse.js
// Proxy para la API de Loyverse - resuelve el problema de CORS
// El token se guarda como variable de entorno en Netlify

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Loyverse-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Token: desde variable de entorno Netlify (preferido) o desde header
  const token = process.env.LOYVERSE_TOKEN || event.headers['x-loyverse-token'];

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token de Loyverse no configurado' }),
    };
  }

  // Path de la API de Loyverse
  const path = event.path.replace('/api/loyverse', '').replace('/.netlify/functions/loyverse', '') || '/items';
  const queryString = event.queryStringParameters
    ? '?' + new URLSearchParams(event.queryStringParameters).toString()
    : '';

  const loyverseUrl = `https://api.loyverse.com/v1.0${path}${queryString}`;

  try {
    const response = await fetch(loyverseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error conectando con Loyverse: ' + error.message }),
    };
  }
};
