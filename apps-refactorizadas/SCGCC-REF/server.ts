import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'SCGCC V1.0 - Gestión de Correspondencia Corporativa CORPOELEC',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SCGCC V1.0 corriendo en http://localhost:${PORT}`);
});
