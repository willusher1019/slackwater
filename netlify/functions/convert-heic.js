// Netlify Function — HEIC to JPEG conversion
// Accepts: POST with JSON body { data: "<base64 HEIC>" }
// Returns: JSON { data: "<base64 JPEG>", type: "image/jpeg" }
//
// This runs server-side (Node.js on AWS Lambda) so it works regardless
// of what browser the user is on. Chrome, Firefox, Safari — all get HEIC support.

const heicConvert = require('heic-convert');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.data) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No image data provided' }) };
    }

    const heicBuffer = Buffer.from(body.data, 'base64');

    const jpegBuffer = await heicConvert({
      buffer: heicBuffer,
      format: 'JPEG',
      quality: 0.88
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        data: jpegBuffer.toString('base64'),
        type: 'image/jpeg'
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Conversion failed' })
    };
  }
};
