import app from '../server.js';

export default function handler(req: any, res: any) {
  try {
    let url = req.url || '';

    // Standardize URL path to ensure it starts with /api
    const pathWithoutQuery = url.split('?')[0];
    if (!pathWithoutQuery.startsWith('/api')) {
      url = '/api' + (url.startsWith('/') ? '' : '/') + url;
    }

    req.url = url;
    req.originalUrl = url;

    // Solución para Vercel Serverless Stream Lock:
    if (req.body !== undefined && req.body !== null) {
      req._body = true;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Error en Vercel API Handler:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Error interno del servidor en la función de Vercel.'
      });
    }
  }
}
