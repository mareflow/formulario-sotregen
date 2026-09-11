// ==============================================================================
// SCRIPT DO GOOGLE APPS SCRIPT PARA O GOOGLE SHEETS
// Sotregen — Pesquisa de Satisfação & Qualidade
// ==============================================================================
//
// COMO USAR:
// 1. Abra uma nova Planilha no Google Drive (sheets.google.com).
// 2. No menu superior, clique em "Extensões" > "Apps Script".
// 3. Apague tudo que estiver lá e cole todo este código abaixo.
// 4. Clique em "Salvar" (ícone de disquete).
// 5. Clique no botão azul "Implantar" (topo direito) > "Nova implantação".
// 6. No ícone de engrenagem, selecione "App da Web".
// 7. Configure:
//    - Descrição: API Pesquisa Sotregen
//    - Executar como: "Eu" (sua conta Google)
//    - Quem tem acesso: "Qualquer pessoa" (necessário para os clientes enviarem)
// 8. Clique em "Implantar", autorize o acesso da sua conta Google e copie a URL gerada!
// ==============================================================================

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.setName("Respostas");
  
  var headers = [
    "ID",
    "Data de Envio",
    "Responsável",
    "Empresa",
    "Contato",
    "Q1 - Clareza Relatórios",
    "Q2 - Agilidade Suporte",
    "Q3 - Proatividade",
    "Q4 - Compreensão Negócio",
    "Q5 - Qualidade Criativos",
    "Q6 - Frequência Testes",
    "Q7 - Qualidade Leads",
    "Q8 - Retorno ROAS/ROI",
    "Q9 - Compromisso Metas",
    "Q10 - Custo-Benefício",
    "Q11 - Segurança Verba",
    "Q12 - Intenção Renovação",
    "Q13 - Indicação Recomendação",
    "Média Comunicação",
    "Média Estratégia",
    "Média Desempenho",
    "Média Parceria",
    "Média Geral (CSAT)",
    "Classificação NPS",
    "Comentários e Sugestões"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
}

// 1. Receber avaliação do cliente (POST)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Se a primeira linha estiver vazia, cria os cabeçalhos
    if (sheet.getLastRow() === 0) {
      setupSheet();
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var a = data.answers || {};
    var avgCom = Number(((Number(a.q1||0) + Number(a.q2||0) + Number(a.q3||0)) / 3).toFixed(2));
    var avgEst = Number(((Number(a.q4||0) + Number(a.q5||0) + Number(a.q6||0)) / 3).toFixed(2));
    var avgDes = Number(((Number(a.q7||0) + Number(a.q8||0) + Number(a.q9||0)) / 3).toFixed(2));
    var avgPar = Number(((Number(a.q10||0) + Number(a.q11||0) + Number(a.q12||0) + Number(a.q13||0)) / 4).toFixed(2));

    var totalSum = 0;
    for (var i = 1; i <= 13; i++) totalSum += Number(a['q' + i] || 0);
    var overallAvg = Number((totalSum / 13).toFixed(2));

    var npsCategory = "neutro";
    var npsVal = a.q13 || a.q12 || 0;
    if (npsVal >= 5 || overallAvg >= 4.5) npsCategory = "promotor";
    else if (npsVal <= 3 || overallAvg < 3.5) npsCategory = "detrator";

    var id = "sot_" + new Date().getTime();
    var nowStr = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");

    var newRow = [
      id,
      nowStr,
      data.clientName || "",
      data.companyName || "",
      data.contact || "",
      a.q1 || 0,
      a.q2 || 0,
      a.q3 || 0,
      a.q4 || 0,
      a.q5 || 0,
      a.q6 || 0,
      a.q7 || 0,
      a.q8 || 0,
      a.q9 || 0,
      a.q10 || 0,
      a.q11 || 0,
      a.q12 || 0,
      a.q13 || 0,
      avgCom,
      avgEst,
      avgDes,
      avgPar,
      overallAvg,
      npsCategory,
      data.comments || ""
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Gravado com sucesso no Google Sheets!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Entregar avaliações para o Painel Admin da Sotregen (GET)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ count: 0, feedbacks: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var feedbacks = [];

    // Ignora a linha 0 de cabeçalho
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      feedbacks.push({
        id: row[0],
        createdAt: row[1],
        clientName: row[2],
        companyName: row[3],
        contact: row[4],
        answers: {
          q1: Number(row[5]),
          q2: Number(row[6]),
          q3: Number(row[7]),
          q4: Number(row[8]),
          q5: Number(row[9]),
          q6: Number(row[10]),
          q7: Number(row[11]),
          q8: Number(row[12]),
          q9: Number(row[13]),
          q10: Number(row[14]),
          q11: Number(row[15]),
          q12: Number(row[16]),
          q13: Number(row[17])
        },
        metrics: {
          avgComunicacao: Number(row[18]),
          avgEstrategia: Number(row[19]),
          avgDesempenho: Number(row[20]),
          avgParceria: Number(row[21]),
          overallAvg: Number(row[22]),
          npsCategory: row[23]
        },
        comments: row[24] || ""
      });
    }

    // Inverte para ter os mais recentes primeiro
    feedbacks.reverse();

    return ContentService.createTextOutput(JSON.stringify({ count: feedbacks.length, feedbacks: feedbacks }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString(), feedbacks: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
