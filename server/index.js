import express from 'express';
import cors from 'cors';
import plantumlEncoder from 'plantuml-encoder';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PLANTUML_SERVER = process.env.PLANTUML_SERVER || 'https://www.plantuml.com/plantuml';

app.post('/api/render', async (req, res) => {
  const { text, format = 'svg' } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (format !== 'svg' && format !== 'png') {
    return res.status(400).json({ error: 'format must be svg or png' });
  }

  try {
    const encoded = plantumlEncoder.encode(text);
    const url = `${PLANTUML_SERVER}/${format}/${encoded}`;
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return res.status(502).json({ error: `PlantUML server responded ${upstream.status}` });
    }

    if (format === 'svg') {
      const svg = await upstream.text();
      res.json({ svg });
    } else {
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.json({ png: buf.toString('base64') });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`PlantUML render server listening on :${PORT}`));
