# Sotregen — Formulário de Pesquisa de Satisfação & Painel com Gráficos

Aplicação criada exclusivamente para a **Sotregen** (Agência de Tráfego Pago), desenvolvida na arquitetura mais simples, leve e direta possível: **HTML, CSS e JavaScript puros**, com persistência local e script SQL independente para banco de dados.

---

## 🎯 Estrutura do Sistema

O projeto é composto por arquivos diretos e fáceis de editar:

1. **`index.html` (Formulário do Cliente)**:
   - Link público enviado aos clientes (via WhatsApp ou e-mail).
   - Identificação do cliente: Nome, Empresa/Marca e Contato (WhatsApp/E-mail).
   - **12 Perguntas Estratégicas Fechadas (Notas de 1 a 5)** divididas nos 4 pilares da agência:
     - **Comunicação & Atendimento:** Clareza nos relatórios, agilidade no suporte e proatividade da equipe.
     - **Estratégia & Planejamento:** Compreensão do nicho e público, qualidade dos criativos/anúncios e rotina de testes de campanhas.
     - **Desempenho & Resultados:** Qualidade dos leads/vendas geradas, retorno financeiro (ROAS / ROI) e cumprimento de metas.
     - **Parceria & Confiança:** Custo-benefício do serviço, segurança na gestão de verba de anúncios e probabilidade de indicação (NPS).
   - **1 Pergunta Dissertativa Livre:** Espaço aberto para elogios, críticas construtivas e sugestões.
   - **Barra de Progresso Dinâmica:** Mostra em tempo real quantas perguntas faltam responder.
   - **Tela de Agradecimento:** Confirmação personalizada ao cliente após o envio.

2. **`admin.html` (Painel da Agência & Gráficos)**:
   - Botão **"📋 Copiar Link do Formulário"**: Copia com 1 clique o link para você colar no WhatsApp dos seus clientes.
   - Botão **"📥 Exportar Excel (CSV)"**: Gera planilha compatível diretamente com o Microsoft Excel em português.
   - Botão **"✨ Carregar 3 Exemplos Demo"**: Para testar e visualizar os gráficos imediatamente com dados reais.
   - **Cards de Indicadores Chave (KPIs)**:
     - Total de avaliações recebidas
     - CSAT Geral (Nota média de 1 a 5 e percentual de aprovação)
     - Net Promoter Score (NPS) com contagem de Promotores, Neutros e Detratores
     - Médias dos 4 Pilares com mini barras visuais de progresso
   - **Gráficos Visuais Interativos (via Chart.js)**:
     - Gráfico comparativo dos 4 Pilares Estratégicos
     - Gráfico de Rosca com a Distribuição de Satisfação (Excelente, Bom, Regular, Insatisfeito)
     - Gráfico Horizontal detalhando a média de cada uma das 12 perguntas
   - **Mural de Feedbacks Abertos**: Depoimentos e comentários escritos pelos clientes.
   - **Tabela com Histórico Completo**: Busca em tempo real e botão **"👁️ Ver Ficha"** que abre um modal com todas as 12 respostas individuais do cliente.

3. **`server.js` (Servidor Node.js Simples)**:
   - Servidor leve que salva as avaliações automaticamente no arquivo `data/feedbacks.json`.

4. **`schema.sql` (Banco de Dados SQL Independente)**:
   - Script SQL pronto, documentado e formatado para ser executado no **Supabase** ou em qualquer instância de **PostgreSQL**, caso no futuro você queira subir para a nuvem.

---

## 🚀 Como Rodar o Projeto

### Opção 1: Rodando com o Servidor Local (Recomendado)

Na pasta do projeto, abra o terminal e execute:

```bash
npm start
```

Pronto! Acesse no seu navegador:
- **Formulário do Cliente:** `http://localhost:3000/index.html`
- **Painel com Gráficos:** `http://localhost:3000/admin.html`

### Opção 2: Abrindo Diretamente no Navegador (Sem Servidor)
Como o sistema foi construído em **HTML, CSS e JavaScript puros**, você também pode simplesmente dar um **duplo clique no arquivo `index.html`** ou `admin.html` no Windows Explorer! O sistema possui sincronização automática em `localStorage` que garante o funcionamento mesmo offline.

---

## 📁 Estrutura de Arquivos

```
formulario sotregen/
├── index.html         # Formulário do Cliente (12 perguntas + 1 aberta)
├── admin.html         # Painel de Gestão com Gráficos e Métricas
├── style.css          # Estilos modernos em CSS puro (tema dark obsidian)
├── app.js             # JavaScript do formulário (validação e progresso)
├── admin.js           # JavaScript do painel (Chart.js, KPIs e exportação)
├── server.js          # Servidor Node.js simples
├── schema.sql         # Script SQL para Supabase / PostgreSQL
├── README.md          # Este manual
└── data/
    └── feedbacks.json # Banco de dados local em arquivo JSON
```
