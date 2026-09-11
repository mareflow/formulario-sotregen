// ==============================================================================
// SOTREGEN — Script do Formulário do Cliente (JavaScript Puro)
// ==============================================================================

const PILLARS = [
  {
    id: 'comunicacao',
    title: 'Comunicação & Atendimento',
    icon: '⚡',
    color: '#38bdf8',
    questions: [
      {
        id: 1,
        code: 'q1',
        title: 'Clareza nos Alinhamentos e Relatórios',
        desc: 'Apresentamos dados, métricas e o andamento das suas campanhas com clareza, transparência e fácil compreensão?'
      },
      {
        id: 2,
        code: 'q2',
        title: 'Agilidade no Atendimento e Suporte',
        desc: 'Como você avalia a presteza e o tempo de resposta da nossa equipe para tirar dúvidas ou realizar ajustes solicitados no dia a dia?'
      },
      {
        id: 3,
        code: 'q3',
        title: 'Proatividade da Equipe',
        desc: 'Nossa equipe traz novas ideias, sugestões de melhoria e oportunidades de otimização de forma proativa para o seu negócio?'
      }
    ]
  },
  {
    id: 'estrategia',
    title: 'Estratégia & Planejamento',
    icon: '🎯',
    color: '#818cf8',
    questions: [
      {
        id: 4,
        code: 'q4',
        title: 'Compreensão do seu Negócio e Público-Alvo',
        desc: 'O quanto nossa equipe compreende o nicho de mercado da sua empresa, seu cliente ideal e seus objetivos comerciais?'
      },
      {
        id: 5,
        code: 'q5',
        title: 'Qualidade dos Anúncios e Criativos',
        desc: 'Nível de satisfação com os textos persuasivos (copies), artes visuais, vídeos e formatos desenvolvidos para suas campanhas.'
      },
      {
        id: 6,
        code: 'q6',
        title: 'Rotina e Frequência de Testes',
        desc: 'Satisfação quanto à renovação e testes contínuos de novos públicos, palavras-chave e formatos de anúncios.'
      }
    ]
  },
  {
    id: 'desempenho',
    title: 'Desempenho & Resultados',
    icon: '🏆',
    color: '#34d399',
    questions: [
      {
        id: 7,
        code: 'q7',
        title: 'Qualidade dos Leads e Conversões',
        desc: 'O perfil e a qualidade dos contatos, leads ou vendas gerados atendem às expectativas comerciais da sua empresa?'
      },
      {
        id: 8,
        code: 'q8',
        title: 'Retorno sobre o Investimento (ROAS / ROI)',
        desc: 'Como você avalia o retorno financeiro obtido em relação ao valor investido nas campanhas de tráfego pago?'
      },
      {
        id: 9,
        code: 'q9',
        title: 'Compromisso com Prazos e Metas',
        desc: 'Nível de seriedade, comprometimento e consistência da agência em relação às metas e prazos acordados.'
      }
    ]
  },
  {
    id: 'parceria',
    title: 'Parceria & Continuidade',
    icon: '🤝',
    color: '#fbbf24',
    questions: [
      {
        id: 10,
        code: 'q10',
        title: 'Custo-Benefício da Prestação de Serviço',
        desc: 'O valor percebido na entrega, dedicação e suporte da Sotregen em relação ao investimento mensal contratado.'
      },
      {
        id: 11,
        code: 'q11',
        title: 'Segurança na Gestão do seu Orçamento',
        desc: 'Nível de tranquilidade e confiança na forma responsável e estratégica como sua verba de mídia é administrada.'
      },
      {
        id: 12,
        code: 'q12',
        title: 'Intenção de Renovação e Continuidade da Parceria',
        desc: 'De 1 a 5, qual é a sua intenção de dar continuidade aos serviços e renovar a parceria com a Sotregen nos próximos ciclos?'
      },
      {
        id: 13,
        code: 'q13',
        title: 'Indicação e Recomendação',
        desc: 'Qual a probabilidade de você recomendar a assessoria de tráfego pago da Sotregen para outros empresários ou parceiros?'
      }
    ]
  }
];

const RATING_LABELS = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
};

const answers = {};

// Renderizar perguntas ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  renderQuestions();
  setupEventListeners();
});

function renderQuestions() {
  const container = document.getElementById('questions-container');
  if (!container) return;

  let html = '';

  PILLARS.forEach((pillar) => {
    html += `
      <div class="pillar-divider">
        <div class="pillar-icon" style="background: rgba(${pillar.color === '#38bdf8' ? '56, 189, 248' : pillar.color === '#818cf8' ? '129, 140, 248' : pillar.color === '#34d399' ? '52, 211, 153' : '251, 191, 36'}, 0.15); color: ${pillar.color};">
          ${pillar.icon}
        </div>
        <div class="pillar-title">
          <h3 style="color: ${pillar.color};">${pillar.title}</h3>
          <p>Avalie cada item de 1 (Muito Insatisfeito) a 5 (Muito Satisfeito)</p>
        </div>
      </div>
    `;

    pillar.questions.forEach((q) => {
      html += `
        <div class="question-item" id="card-${q.code}">
          <div class="question-meta">
            <span class="q-badge">Q${q.id}</span>
            <div>
              <div class="q-title">${q.title}</div>
              <div class="q-desc">${q.desc}</div>
            </div>
          </div>

          <div class="rating-grid">
            ${[1, 2, 3, 4, 5].map((score) => `
              <button 
                type="button" 
                class="rating-btn" 
                data-code="${q.code}" 
                data-score="${score}"
                onclick="selectScore('${q.code}', ${score})"
              >
                <span class="score-num">${score}</span>
                <span class="score-text">${RATING_LABELS[score]}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    });
  });

  container.innerHTML = html;
}

// Selecionar nota de uma pergunta
window.selectScore = function(code, score) {
  answers[code] = score;

  // Atualizar visual dos botões desta pergunta
  const card = document.getElementById(`card-${code}`);
  if (card) {
    card.classList.add('answered');
    const buttons = card.querySelectorAll('.rating-btn');
    buttons.forEach((btn) => {
      const btnScore = parseInt(btn.getAttribute('data-score'), 10);
      btn.className = 'rating-btn'; // reseta
      if (btnScore === score) {
        btn.classList.add(`active-${score}`);
      }
    });
  }

  updateProgress();
};

function getTotalQuestions() {
  let count = 0;
  PILLARS.forEach(p => count += p.questions.length);
  return count;
}

function updateProgress() {
  const answeredCount = Object.keys(answers).length;
  const total = getTotalQuestions();
  const percent = Math.round((answeredCount / total) * 100);

  const answeredElem = document.getElementById('answered-count');
  if (answeredElem) answeredElem.textContent = answeredCount;

  const totalElem = document.getElementById('total-count');
  if (totalElem) totalElem.textContent = total;

  const pctElem = document.getElementById('progress-percentage');
  if (pctElem) pctElem.textContent = `${percent}%`;

  const fillElem = document.getElementById('progress-fill');
  if (fillElem) fillElem.style.width = `${percent}%`;

  const btnSubmit = document.getElementById('btn-submit');
  const statusText = document.getElementById('submit-status-text');

  if (btnSubmit && statusText) {
    if (answeredCount === total) {
      btnSubmit.removeAttribute('disabled');
      statusText.textContent = `✓ Todas as ${total} perguntas foram respondidas! Pronto para enviar.`;
      statusText.style.color = '#34d399';
    } else {
      btnSubmit.setAttribute('disabled', 'true');
      statusText.textContent = `Você respondeu ${answeredCount} de ${total} perguntas obrigatórias.`;
      statusText.style.color = 'var(--text-muted)';
    }
  }
}

function setupEventListeners() {
  const form = document.getElementById('survey-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('form-error');
    errorBox.style.display = 'none';

    const clientName = document.getElementById('clientName').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const comments = document.getElementById('comments').value.trim();
    const total = getTotalQuestions();

    if (!clientName || !companyName) {
      errorBox.textContent = 'Por favor, preencha seu nome e o nome da sua empresa.';
      errorBox.style.display = 'block';
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (Object.keys(answers).length < total) {
      errorBox.textContent = `Por favor, responda a todas as ${total} perguntas antes de enviar.`;
      errorBox.style.display = 'block';
      return;
    }

    const payload = {
      clientName,
      companyName,
      contact,
      answers,
      comments
    };

    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.textContent = 'Enviando...';
    btnSubmit.setAttribute('disabled', 'true');

    try {
      // 1. Tentar salvar no servidor local via API
      let saved = false;
      try {
        const res = await fetch('/api/feedbacks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          saved = true;
        }
      } catch (err) {
        console.warn('Servidor offline, salvando localmente no navegador:', err);
      }

      // 2. Sempre salvar também no localStorage para garantir persistência autônoma
      saveToLocalStorage(payload);

      // Exibir tela de sucesso
      document.getElementById('survey-form').style.display = 'none';
      document.getElementById('success-client-msg').innerHTML = `
        Agradecemos imensamente por dedicar seu tempo, <strong>${clientName}</strong> (${companyName}). 
        Suas respostas já foram computadas na Sotregen.
      `;
      document.getElementById('success-screen').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      errorBox.textContent = 'Erro ao processar envio. Tente novamente.';
      errorBox.style.display = 'block';
      btnSubmit.textContent = 'Enviar Minha Avaliação';
      btnSubmit.removeAttribute('disabled');
    }
  });
}

function saveToLocalStorage(data) {
  const list = JSON.parse(localStorage.getItem('sotregen_feedbacks') || '[]');

  // Calcular métricas
  const a = data.answers;
  const avgCom = Number(((a.q1 + a.q2 + a.q3) / 3).toFixed(2));
  const avgEst = Number(((a.q4 + a.q5 + a.q6) / 3).toFixed(2));
  const avgDes = Number(((a.q7 + a.q8 + a.q9) / 3).toFixed(2));
  const parCount = (a.q13 !== undefined ? 4 : 3);
  const avgPar = Number(((a.q10 + a.q11 + a.q12 + (a.q13 || 0)) / parCount).toFixed(2));
  const totalSum = Object.values(a).reduce((sum, v) => sum + v, 0);
  const overallAvg = Number((totalSum / Object.keys(a).length).toFixed(2));
  const renovacaoScore = a.q12 || 0;

  let npsCategory = 'neutro';
  const npsQuestion = a.q13 !== undefined ? a.q13 : a.q12;
  if (npsQuestion >= 5 || overallAvg >= 4.5) npsCategory = 'promotor';
  else if (npsQuestion <= 3 || overallAvg < 3.5) npsCategory = 'detrator';

  const entry = {
    id: 'sot_' + Date.now(),
    createdAt: new Date().toISOString(),
    ...data,
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

  list.unshift(entry);
  localStorage.setItem('sotregen_feedbacks', JSON.stringify(list));
}

window.resetForm = function() {
  document.getElementById('survey-form').reset();
  for (let k in answers) delete answers[k];
  document.querySelectorAll('.question-item').forEach(c => c.classList.remove('answered'));
  document.querySelectorAll('.rating-btn').forEach(b => b.className = 'rating-btn');
  updateProgress();
  document.getElementById('success-screen').style.display = 'none';
  document.getElementById('survey-form').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
