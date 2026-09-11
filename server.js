import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'feedbacks.json');

// Criar pasta de dados se não existir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function getFeedbacks() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveFeedbacks(list) {
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json());
// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(__dirname));

// Rota exclusiva para o cliente (Formulário)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota exclusiva da agência (Painel de Gestão)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rota para ler avaliações
app.get('/api/feedbacks', (req, res) => {
  const feedbacks = getFeedbacks();
  res.json({ count: feedbacks.length, feedbacks });
});

// Rota para salvar avaliação do cliente
app.post('/api/feedbacks', (req, res) => {
  try {
    const { clientName, companyName, contact, answers, comments } = req.body;
    if (!clientName || !companyName) {
      return res.status(400).json({ error: 'Nome e Empresa são obrigatórios.' });
    }

    const feedbacks = getFeedbacks();

    // Calcular médias
    const a = answers || {};
    const avgCom = Number(((Number(a.q1||0) + Number(a.q2||0) + Number(a.q3||0)) / 3).toFixed(2));
    const avgEst = Number(((Number(a.q4||0) + Number(a.q5||0) + Number(a.q6||0)) / 3).toFixed(2));
    const avgDes = Number(((Number(a.q7||0) + Number(a.q8||0) + Number(a.q9||0)) / 3).toFixed(2));
    const parCount = a.q13 !== undefined ? 4 : 3;
    const avgPar = Number(((Number(a.q10||0) + Number(a.q11||0) + Number(a.q12||0) + Number(a.q13||0)) / parCount).toFixed(2));

    const totalQuestions = a.q13 !== undefined ? 13 : 12;
    let total = 0;
    for (let i = 1; i <= totalQuestions; i++) total += Number(a[`q${i}`] || 0);
    const overallAvg = Number((total / totalQuestions).toFixed(2));
    const renovacaoScore = Number(a.q12 || 0);

    let npsCategory = 'neutro';
    const npsVal = a.q13 !== undefined ? a.q13 : a.q12;
    if (npsVal >= 5 || overallAvg >= 4.5) npsCategory = 'promotor';
    else if (npsVal <= 3 || overallAvg < 3.5) npsCategory = 'detrator';

    const newEntry = {
      id: 'sot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      contact: (contact || '').trim(),
      answers: a,
      comments: (comments || '').trim(),
      metrics: {
        avgComunicacao: avgCom,
        avgEstrategia: avgEst,
        avgDesempenho: avgDes,
        avgParceria: avgPar,
        overallAvg: overallAvg,
        renovacaoScore: renovacaoScore,
        npsCategory: npsCategory
      }
    };

    feedbacks.unshift(newEntry);
    saveFeedbacks(feedbacks);

    res.status(201).json({ success: true, feedback: newEntry });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar avaliação.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Sistema Sotregen rodando com sucesso!`);
  console.log(`👉 Formulário do Cliente: http://localhost:${PORT}/index.html`);
  console.log(`👉 Painel de Gráficos:    http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
