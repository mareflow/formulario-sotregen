// ==============================================================================
// SOTREGEN — Script do Painel Admin & Gráficos (JavaScript Puro + Chart.js)
// ==============================================================================

let feedbacksData = [];
let chartPillarsInstance = null;
let chartDistributionInstance = null;
let chartQuestionsInstance = null;
let chartRadarInstance = null;

const QUESTION_TITLES = {
  q1: 'Clareza nos Alinhamentos e Relatórios',
  q2: 'Agilidade no Suporte e Atendimento',
  q3: 'Proatividade da Equipe',
  q4: 'Compreensão do seu Negócio e Público',
  q5: 'Qualidade dos Criativos e Anúncios',
  q6: 'Método e Frequência de Testes',
  q7: 'Qualidade dos Leads e Conversões',
  q8: 'Retorno sobre o Investimento (ROAS / ROI)',
  q9: 'Cumprimento de Metas e Prazos',
  q10: 'Custo-Benefício do Serviço',
  q11: 'Segurança na Gestão de Verba de Mídia',
  q12: 'Intenção de Renovação e Continuidade',
  q13: 'Indicação e Recomendação'
};

// URL da Planilha Google (Apps Script Web App)
function getGoogleSheetsUrl() {
  return window.SOTREGEN_SHEETS_URL || localStorage.getItem('sotregen_sheets_url') || '';
}

document.addEventListener('DOMContentLoaded', () => {
  updateSheetsStatusBadge();
  loadData();
});

function updateSheetsStatusBadge() {
  const pill = document.getElementById('sheets-status-pill');
  if (!pill) return;
  const url = getGoogleSheetsUrl();
  if (url) {
    pill.textContent = '🟢 Google Sheets: Conectado';
    pill.style.background = 'rgba(16, 185, 129, 0.15)';
    pill.style.color = '#34d399';
    pill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  } else {
    pill.textContent = '⚪ Google Sheets: Não conectado';
    pill.style.background = 'rgba(148, 163, 184, 0.15)';
    pill.style.color = '#94a3b8';
    pill.style.borderColor = 'rgba(148, 163, 184, 0.3)';
  }
}

async function loadData() {
  let loadedFromCloud = false;
  const sheetsUrl = getGoogleSheetsUrl();

  // 1. Tenta carregar do Google Sheets se configurado
  if (sheetsUrl) {
    try {
      const res = await fetch(sheetsUrl);
      const data = await res.json();
      if (data.feedbacks && data.feedbacks.length > 0) {
        feedbacksData = data.feedbacks;
        loadedFromCloud = true;
      }
    } catch (err) {
      console.warn('Aviso: erro ao sincronizar com Google Sheets:', err);
    }
  }

  // 2. Tenta carregar do servidor local via API se não carregou da nuvem
  if (!loadedFromCloud) {
    try {
      const res = await fetch('/api/feedbacks');
      if (res.ok) {
        const data = await res.json();
        feedbacksData = data.feedbacks || [];
        loadedFromCloud = true;
      }
    } catch (err) {
      // API local offline, prossegue para o armazenamento local
    }
  }

  // 3. Fallback para o armazenamento local se necessário
  if (!loadedFromCloud || feedbacksData.length === 0) {
    const local = JSON.parse(localStorage.getItem('sotregen_feedbacks') || '[]');
    if (local.length > 0) {
      feedbacksData = local;
    }
  }

  // Atualizar tela
  renderDashboard();
}

function renderDashboard() {
  calculateKPIs();
  renderCharts();
  renderComments();
  renderTable();
}

function calculateKPIs() {
  const total = feedbacksData.length;
  document.getElementById('kpi-total').textContent = total;

  if (total === 0) {
    document.getElementById('kpi-csat').textContent = '0.00';
    document.getElementById('kpi-csat-percent').textContent = 'Nenhuma resposta ainda';
    document.getElementById('kpi-nps').textContent = '0';
    document.getElementById('kpi-nps-distribution').textContent = '0 Favoráveis | 0 Neutros | 0 Críticos';
    return;
  }

  let sumOverall = 0;
  let sumCom = 0;
  let sumEst = 0;
  let sumDes = 0;
  let sumPar = 0;
  let promotores = 0;
  let neutros = 0;
  let detratores = 0;

  feedbacksData.forEach((f) => {
    const m = f.metrics;
    sumOverall += m.overallAvg;
    sumCom += m.avgComunicacao;
    sumEst += m.avgEstrategia;
    sumDes += m.avgDesempenho;
    sumPar += m.avgParceria;

    if (m.npsCategory === 'promotor') promotores++;
    else if (m.npsCategory === 'detrator') detratores++;
    else neutros++;
  });

  const avgOverall = (sumOverall / total).toFixed(2);
  const percentOverall = Math.round((avgOverall / 5) * 100);
  const nps = Math.round(((promotores - detratores) / total) * 100);

  // KPIs Top
  document.getElementById('kpi-csat').textContent = avgOverall;
  document.getElementById('kpi-csat-percent').textContent = `${percentOverall}% de aprovação na escala 1 a 5`;

  const npsElem = document.getElementById('kpi-nps');
  npsElem.textContent = `${nps > 0 ? '+' : ''}${nps}`;
  npsElem.style.color = nps >= 50 ? '#34d399' : '#38bdf8';

  document.getElementById('kpi-nps-distribution').innerHTML = `
    <span style="color: #34d399;">● ${promotores} Favoráveis</span> | 
    <span style="color: #facc15;">● ${neutros} Neutros</span> | 
    <span style="color: #f87171;">● ${detratores} Críticos</span>
  `;

  // Intenção de Renovação (Pergunta Chave Q12)
  let sumRenovacao = 0;
  let altaRenovacao = 0;
  feedbacksData.forEach((f) => {
    const ren = f.answers?.q12 || 0;
    sumRenovacao += ren;
    if (ren >= 4) altaRenovacao++;
  });
  const avgRenovacaoVal = total > 0 ? (sumRenovacao / total).toFixed(2) : '0.00';
  const pctRenovacao = total > 0 ? Math.round((altaRenovacao / total) * 100) : 0;

  const renElem = document.getElementById('kpi-renovacao');
  if (renElem) {
    renElem.innerHTML = `${avgRenovacaoVal} <span style="font-size: 15px; color: var(--text-muted);">/ 5</span>`;
    document.getElementById('kpi-renovacao-sub').textContent = `${pctRenovacao}% com alta intenção de renovar (notas 4 e 5)`;
  }

  // Pilares
  const avgComVal = (sumCom / total).toFixed(2);
  const avgEstVal = (sumEst / total).toFixed(2);
  const avgDesVal = (sumDes / total).toFixed(2);
  const avgParVal = (sumPar / total).toFixed(2);

  document.getElementById('pillar-comunicacao').innerHTML = `${avgComVal} <span style="font-size: 13px; color: var(--text-muted);">/ 5</span>`;
  document.getElementById('bar-comunicacao').style.width = `${(avgComVal / 5) * 100}%`;

  document.getElementById('pillar-estrategia').innerHTML = `${avgEstVal} <span style="font-size: 13px; color: var(--text-muted);">/ 5</span>`;
  document.getElementById('bar-estrategia').style.width = `${(avgEstVal / 5) * 100}%`;

  document.getElementById('pillar-desempenho').innerHTML = `${avgDesVal} <span style="font-size: 13px; color: var(--text-muted);">/ 5</span>`;
  document.getElementById('bar-desempenho').style.width = `${(avgDesVal / 5) * 100}%`;

  document.getElementById('pillar-parceria').innerHTML = `${avgParVal} <span style="font-size: 13px; color: var(--text-muted);">/ 5</span>`;
  document.getElementById('bar-parceria').style.width = `${(avgParVal / 5) * 100}%`;
}

function renderCharts() {
  const total = feedbacksData.length;

  let avgCom = 0, avgEst = 0, avgDes = 0, avgPar = 0;
  let dist = { excelente: 0, bom: 0, regular: 0, insatisfeito: 0 };
  let qSums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0, q11: 0, q12: 0, q13: 0 };

  if (total > 0) {
    feedbacksData.forEach((f) => {
      avgCom += f.metrics.avgComunicacao;
      avgEst += f.metrics.avgEstrategia;
      avgDes += f.metrics.avgDesempenho;
      avgPar += f.metrics.avgParceria;

      const ov = f.metrics.overallAvg;
      if (ov >= 4.5) dist.excelente++;
      else if (ov >= 3.5) dist.bom++;
      else if (ov >= 2.5) dist.regular++;
      else dist.insatisfeito++;

      for (let i = 1; i <= 13; i++) {
        qSums[`q${i}`] += (f.answers[`q${i}`] || 0);
      }
    });

    avgCom = Number((avgCom / total).toFixed(2));
    avgEst = Number((avgEst / total).toFixed(2));
    avgDes = Number((avgDes / total).toFixed(2));
    avgPar = Number((avgPar / total).toFixed(2));
  }

  // 1. Gráfico Pilares
  const ctxPillars = document.getElementById('chartPillars').getContext('2d');
  if (chartPillarsInstance) chartPillarsInstance.destroy();
  chartPillarsInstance = new Chart(ctxPillars, {
    type: 'bar',
    data: {
      labels: ['Comunicação', 'Estratégia', 'Desempenho & ROI', 'Parceria'],
      datasets: [{
        data: [avgCom, avgEst, avgDes, avgPar],
        backgroundColor: [
          'rgba(56, 189, 248, 0.75)',
          'rgba(129, 140, 248, 0.75)',
          'rgba(52, 211, 153, 0.75)',
          'rgba(251, 191, 36, 0.75)'
        ],
        borderColor: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 5, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: '#cbd5e1', font: { weight: '600' } }, grid: { display: false } }
      }
    }
  });

  // 2. Gráfico Distribuição (Rosca)
  const ctxDist = document.getElementById('chartDistribution').getContext('2d');
  if (chartDistributionInstance) chartDistributionInstance.destroy();
  chartDistributionInstance = new Chart(ctxDist, {
    type: 'doughnut',
    data: {
      labels: ['Excelente (4.5 a 5)', 'Bom (3.5 a 4.4)', 'Regular (2.5 a 3.4)', 'Insatisfeito (< 2.5)'],
      datasets: [{
        data: [dist.excelente, dist.bom, dist.regular, dist.insatisfeito],
        backgroundColor: ['#10b981', '#0ea5e9', '#eab308', '#ef4444'],
        borderColor: '#121826',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 12, font: { size: 11.5 } } }
      }
    }
  });

  // 3. Gráfico Radar (Equilíbrio)
  const ctxRadar = document.getElementById('chartRadar').getContext('2d');
  if (chartRadarInstance) chartRadarInstance.destroy();
  chartRadarInstance = new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: ['Comunicação', 'Estratégia', 'Desempenho', 'Parceria'],
      datasets: [{
        label: 'Média Consolidada',
        data: [avgCom, avgEst, avgDes, avgPar],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#818cf8',
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#818cf8',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: '#cbd5e1', font: { size: 12, weight: '600' } },
          ticks: { color: '#94a3b8', backdropColor: 'transparent', stepSize: 1, min: 0, max: 5 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 3. Gráfico Horizontal Pergunta a Pergunta
  const qAverages = [];
  const qLabels = [];
  for (let i = 1; i <= 13; i++) {
    const key = `q${i}`;
    const avg = total > 0 ? Number((qSums[key] / total).toFixed(2)) : 0;
    qAverages.push(avg);
    qLabels.push(`Q${i} - ${QUESTION_TITLES[key]}`);
  }

  const ctxQuestions = document.getElementById('chartQuestions').getContext('2d');
  if (chartQuestionsInstance) chartQuestionsInstance.destroy();
  chartQuestionsInstance = new Chart(ctxQuestions, {
    type: 'bar',
    data: {
      labels: qLabels,
      datasets: [{
        data: qAverages,
        backgroundColor: 'rgba(56, 189, 248, 0.65)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: 0, max: 5, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#cbd5e1', font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function renderComments() {
  const container = document.getElementById('comments-container');
  const commentsList = feedbacksData.filter(f => f.comments && f.comments.trim().length > 0);

  if (commentsList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--text-muted); font-size: 13.5px;">
        Nenhum comentário dissertativo enviado até o momento.
      </div>
    `;
    return;
  }

  container.innerHTML = commentsList.map((f) => `
    <div class="comment-item">
      <div>
        <div class="comment-head">
          <div>
            <div class="comment-company">${escapeHtml(f.companyName)}</div>
            <div class="comment-author">${escapeHtml(f.clientName)}</div>
          </div>
          <span class="badge badge-${f.metrics.npsCategory}">Nota ${f.metrics.overallAvg}</span>
        </div>
        <p class="comment-body">"${escapeHtml(f.comments)}"</p>
      </div>
      <div class="comment-foot">
        <span>📅 ${new Date(f.createdAt).toLocaleDateString('pt-BR')}</span>
        <span style="text-transform: capitalize;">${f.metrics.npsCategory}</span>
      </div>
    </div>
  `).join('');
}

function renderTable(filterTerm = '') {
  const tbody = document.getElementById('table-body');
  const term = filterTerm.toLowerCase();

  const filtered = feedbacksData.filter(f =>
    f.clientName.toLowerCase().includes(term) ||
    f.companyName.toLowerCase().includes(term) ||
    (f.contact && f.contact.toLowerCase().includes(term)) ||
    (f.comments && f.comments.toLowerCase().includes(term))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 28px; color: var(--text-muted);">
          ${term ? 'Nenhum resultado encontrado.' : 'Nenhuma avaliação registrada ainda.'}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((f) => `
    <tr>
      <td>${new Date(f.createdAt).toLocaleDateString('pt-BR')}</td>
      <td><strong>${escapeHtml(f.companyName)}</strong></td>
      <td>${escapeHtml(f.clientName)}</td>
      <td>${escapeHtml(f.contact || '-')}</td>
      <td><span style="font-weight: 700; color: ${f.metrics.overallAvg >= 4 ? '#34d399' : '#facc15'};">★ ${f.metrics.overallAvg}</span></td>
      <td><span class="badge badge-${f.metrics.npsCategory}">${f.metrics.npsCategory}</span></td>
      <td>
        <button class="btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="viewDetails('${f.id}')">
          👁️ Ver Ficha
        </button>
      </td>
    </tr>
  `).join('');
}

window.filterTable = function() {
  const term = document.getElementById('search-input').value;
  renderTable(term);
};

window.viewDetails = function(id) {
  const feedback = feedbacksData.find(f => f.id === id);
  if (!feedback) return;

  document.getElementById('modal-company').textContent = feedback.companyName;
  document.getElementById('modal-meta').textContent = `Respondido por ${feedback.clientName} em ${new Date(feedback.createdAt).toLocaleString('pt-BR')}`;

  const m = feedback.metrics;
  document.getElementById('modal-averages').innerHTML = `
    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
      <div style="font-size: 11px; color: var(--text-muted);">Geral (CSAT)</div>
      <div style="font-size: 17px; font-weight: 700; color: #38bdf8;">${m.overallAvg} / 5</div>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
      <div style="font-size: 11px; color: var(--text-muted);">Comunicação</div>
      <div style="font-size: 17px; font-weight: 700; color: #38bdf8;">${m.avgComunicacao} / 5</div>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
      <div style="font-size: 11px; color: var(--text-muted);">Estratégia</div>
      <div style="font-size: 17px; font-weight: 700; color: #818cf8;">${m.avgEstrategia} / 5</div>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
      <div style="font-size: 11px; color: var(--text-muted);">Resultados</div>
      <div style="font-size: 17px; font-weight: 700; color: #34d399;">${m.avgDesempenho} / 5</div>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
      <div style="font-size: 11px; color: var(--text-muted);">Parceria</div>
      <div style="font-size: 17px; font-weight: 700; color: #fbbf24;">${m.avgParceria} / 5</div>
    </div>
  `;

  let qListHtml = '';
  for (let i = 1; i <= 13; i++) {
    const key = `q${i}`;
    const score = feedback.answers[key] !== undefined ? feedback.answers[key] : '-';
    const isKey = (i === 12);
    qListHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: ${isKey ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.02)'}; border: ${isKey ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid transparent'}; padding: 8px 12px; border-radius: 6px; font-size: 12.5px;">
        <div>
          <strong style="color: ${isKey ? '#fbbf24' : '#38bdf8'};">Q${i}.</strong> ${QUESTION_TITLES[key]}
          ${isKey ? '<span style="font-size: 10px; background: rgba(251, 191, 36, 0.2); color: #fde68a; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: 700;">★ Renovação</span>' : ''}
        </div>
        <span style="font-weight: 700; color: ${score >= 4 ? '#34d399' : score === 3 ? '#facc15' : '#f87171'};">
          Nota ${score}
        </span>
      </div>
    `;
  }
  document.getElementById('modal-questions-list').innerHTML = qListHtml;

  const commentBox = document.getElementById('modal-comment-box');
  if (feedback.comments && feedback.comments.trim().length > 0) {
    document.getElementById('modal-comment-text').textContent = feedback.comments;
    commentBox.style.display = 'block';
  } else {
    commentBox.style.display = 'none';
  }

  document.getElementById('modal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal').style.display = 'none';
};

window.copyFormLink = function() {
  const origin = window.location.origin;
  let path = window.location.pathname;
  if (path.endsWith('admin.html')) {
    path = path.replace('admin.html', 'index.html');
  } else if (path.endsWith('/')) {
    path = path + 'index.html';
  } else {
    path = '/index.html';
  }
  const url = origin + path;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link do formulário copiado! Envie este link exclusivo para seu cliente.');
  });
};

window.exportToCSV = function() {
  if (feedbacksData.length === 0) {
    showToast('Nenhum dado para exportar.');
    return;
  }

  const headers = [
    'Data',
    'Empresa',
    'Cliente',
    'Contato',
    'Q1 - Clareza Relatórios',
    'Q2 - Agilidade Suporte',
    'Q3 - Proatividade',
    'Q4 - Compreensão Negócio',
    'Q5 - Qualidade Criativos',
    'Q6 - Frequência Testes',
    'Q7 - Qualidade Leads',
    'Q8 - Retorno ROAS/ROI',
    'Q9 - Metas e Prazos',
    'Q10 - Custo Benefício',
    'Q11 - Segurança Verba',
    'Q12 - Intenção de Renovação',
    'Q13 - Indicação e Recomendação',
    'Média Comunicação',
    'Média Estratégia',
    'Média Desempenho',
    'Média Parceria',
    'Média Geral (CSAT)',
    'Classificação NPS',
    'Comentários do Cliente'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = feedbacksData.map(f => [
    escapeCSV(new Date(f.createdAt).toLocaleDateString('pt-BR')),
    escapeCSV(f.companyName),
    escapeCSV(f.clientName),
    escapeCSV(f.contact || ''),
    escapeCSV(f.answers.q1),
    escapeCSV(f.answers.q2),
    escapeCSV(f.answers.q3),
    escapeCSV(f.answers.q4),
    escapeCSV(f.answers.q5),
    escapeCSV(f.answers.q6),
    escapeCSV(f.answers.q7),
    escapeCSV(f.answers.q8),
    escapeCSV(f.answers.q9),
    escapeCSV(f.answers.q10),
    escapeCSV(f.answers.q11),
    escapeCSV(f.answers.q12),
    escapeCSV(f.answers.q13 || f.answers.q12),
    escapeCSV(f.metrics.avgComunicacao),
    escapeCSV(f.metrics.avgEstrategia),
    escapeCSV(f.metrics.avgDesempenho),
    escapeCSV(f.metrics.avgParceria),
    escapeCSV(f.metrics.overallAvg),
    escapeCSV(f.metrics.npsCategory),
    escapeCSV(f.comments || '')
  ].join(';'));

  // UTF-8 BOM para Excel
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sotregen-pesquisa-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Planilha Excel gerada com sucesso!');
};

window.seedDemoData = function() {
  const demo = [
    {
      id: 'demo_1',
      createdAt: new Date().toISOString(),
      clientName: 'Rodrigo Medeiros',
      companyName: 'Medeiros Odonto Premium',
      contact: '(11) 98765-4321',
      answers: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5, q7: 4, q8: 5, q9: 4, q10: 5, q11: 5, q12: 5, q13: 5 },
      comments: 'Excelente trabalho com o Google Ads e Meta! As reuniões mensais são muito claras e tivemos o melhor mês de agendamentos no consultório.',
      metrics: { avgComunicacao: 4.67, avgEstrategia: 4.67, avgDesempenho: 4.33, avgParceria: 5.0, overallAvg: 4.77, renovacaoScore: 5, npsCategory: 'promotor' }
    },
    {
      id: 'demo_2',
      createdAt: new Date().toISOString(),
      clientName: 'Carla Silveira',
      companyName: 'Lumina Cosméticos',
      contact: 'carla@luminacosmeticos.com.br',
      answers: { q1: 4, q2: 4, q3: 3, q4: 4, q5: 5, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 5, q12: 4, q13: 4 },
      comments: 'Campanhas rodando muito bem. Apenas gostaria de relatórios semanais um pouco mais frequentes, mas o suporte sempre responde rápido.',
      metrics: { avgComunicacao: 3.67, avgEstrategia: 4.33, avgDesempenho: 4.0, avgParceria: 4.25, overallAvg: 4.08, renovacaoScore: 4, npsCategory: 'neutro' }
    },
    {
      id: 'demo_3',
      createdAt: new Date().toISOString(),
      clientName: 'Fernando Viana',
      companyName: 'Viana Solar & Engenharia',
      contact: '(31) 99123-8877',
      answers: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5 },
      comments: 'A Sotregen entendeu perfeitamente nosso modelo B2B de energia solar. Os leads chegam qualificados para nossa equipe comercial fechar.',
      metrics: { avgComunicacao: 5.0, avgEstrategia: 5.0, avgDesempenho: 5.0, avgParceria: 5.0, overallAvg: 5.0, renovacaoScore: 5, npsCategory: 'promotor' }
    }
  ];

  feedbacksData = demo;
  localStorage.setItem('sotregen_feedbacks', JSON.stringify(demo));
  renderDashboard();
  showToast('3 avaliações de exemplo carregadas nos gráficos!');
};

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// ------------------------------------------------------------------------------
// Configuração Visual do Google Sheets
// ------------------------------------------------------------------------------
window.openSheetsModal = function() {
  const modal = document.getElementById('sheets-modal');
  const input = document.getElementById('input-sheets-url');
  if (input) {
    input.value = getGoogleSheetsUrl();
  }
  const res = document.getElementById('sheets-test-result');
  if (res) res.style.display = 'none';
  if (modal) modal.style.display = 'flex';
};

window.closeSheetsModal = function() {
  const modal = document.getElementById('sheets-modal');
  if (modal) modal.style.display = 'none';
};

window.saveSheetsUrl = async function() {
  const input = document.getElementById('input-sheets-url');
  const resBox = document.getElementById('sheets-test-result');
  const rawUrl = (input ? input.value : '').trim();

  if (!rawUrl) {
    localStorage.removeItem('sotregen_sheets_url');
    updateSheetsStatusBadge();
    showToast('Conexão com Google Sheets desvinculada.');
    closeSheetsModal();
    return;
  }

  if (!rawUrl.startsWith('https://script.google.com/macros/s/')) {
    if (resBox) {
      resBox.style.display = 'block';
      resBox.style.color = '#f87171';
      resBox.textContent = '⚠️ A URL deve começar com "https://script.google.com/macros/s/..."';
    }
    return;
  }

  if (resBox) {
    resBox.style.display = 'block';
    resBox.style.color = '#38bdf8';
    resBox.textContent = 'Sincronizando com a planilha...';
  }

  try {
    localStorage.setItem('sotregen_sheets_url', rawUrl);
    updateSheetsStatusBadge();

    const resp = await fetch(rawUrl);
    const json = await resp.json();
    
    if (json && json.feedbacks && json.feedbacks.length > 0) {
      feedbacksData = json.feedbacks;
      renderDashboard();
      showToast(`✅ Conectado! ${json.feedbacks.length} respostas sincronizadas da planilha.`);
    } else {
      showToast('✅ Planilha conectada com sucesso! (Aguardando primeiras respostas)');
    }
    
    closeSheetsModal();
  } catch (err) {
    // Mesmo se houver bloqueio temporário, a URL fica salva
    localStorage.setItem('sotregen_sheets_url', rawUrl);
    updateSheetsStatusBadge();
    showToast('✅ URL da planilha salva com sucesso!');
    closeSheetsModal();
  }
};

window.copyAppsScriptCode = async function() {
  try {
    const res = await fetch('google-sheets-script.js');
    if (res.ok) {
      const code = await res.text();
      await navigator.clipboard.writeText(code);
      showToast('📋 Código do Apps Script copiado para a área de transferência!');
      return;
    }
  } catch (e) {}
  showToast('Abra o arquivo google-sheets-script.js na pasta do projeto para copiar.');
};

