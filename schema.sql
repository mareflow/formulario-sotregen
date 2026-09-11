-- ==============================================================================
-- SCHEMA SQL - SOTREGEN (Pesquisa de Satisfação de Tráfego Pago)
-- Compatível com: Supabase / PostgreSQL
-- ==============================================================================

-- 1. Criação da Tabela de Perguntas (Catálogo oficial das 12 perguntas e pilares)
CREATE TABLE IF NOT EXISTS sotregen_questions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    pillar VARCHAR(50) NOT NULL, -- 'comunicacao', 'estrategia', 'desempenho', 'parceria'
    pillar_title VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_num INT NOT NULL DEFAULT 0
);

-- Inserção das 12 perguntas estratégicas
INSERT INTO sotregen_questions (code, pillar, pillar_title, title, description, order_num) VALUES
-- Pilar 1: Comunicação & Atendimento
('q1', 'comunicacao', 'Comunicação & Atendimento', 'Clareza nos Alinhamentos e Relatórios', 'A agência apresenta dados, métricas e o andamento das campanhas de forma compreensível e transparente?', 1),
('q2', 'comunicacao', 'Comunicação & Atendimento', 'Agilidade no Suporte e Atendimento', 'Tempo de resposta e presteza quando você solicita novos direcionamentos, dúvidas ou ajustes no dia a dia.', 2),
('q3', 'comunicacao', 'Comunicação & Atendimento', 'Proatividade da Equipe', 'A equipe sugere novas ideias, novos criativos e otimizações antes mesmo de você precisar solicitar?', 3),

-- Pilar 2: Estratégia & Planejamento
('q4', 'estrategia', 'Estratégia & Planejamento', 'Compreensão do seu Negócio e Público', 'O quanto a equipe da Sotregen compreende o seu nicho, seu público-alvo e os objetivos da sua empresa?', 4),
('q5', 'estrategia', 'Estratégia & Planejamento', 'Qualidade dos Criativos e Anúncios', 'Nível de satisfação com as copies (textos), artes, vídeos e formatos testados nas campanhas.', 5),
('q6', 'estrategia', 'Estratégia & Planejamento', 'Método e Frequência de Testes', 'Satisfação quanto à renovação e testes contínuos de públicos, palavras-chave e criativos.', 6),

-- Pilar 3: Desempenho & Resultados
('q7', 'estrategia', 'Desempenho & Resultados', 'Qualidade dos Leads e Conversões', 'O perfil dos contatos, leads ou vendas geradas atende ao padrão de qualidade que sua empresa necessita?', 7),
('q8', 'desempenho', 'Desempenho & Resultados', 'Retorno sobre o Investimento (ROAS/ROI)', 'Avaliação do retorno financeiro obtido em relação ao valor investido em tráfego pago.', 8),
('q9', 'desempenho', 'Desempenho & Resultados', 'Cumprimento de Metas e Prazos', 'Comprometimento, seriedade e consistência em relação às metas e cronogramas estipulados.', 9),

-- Pilar 4: Parceria & Confiança
('q10', 'parceria', 'Parceria & Confiança', 'Custo-Benefício do Serviço', 'O valor percebido na entrega da Sotregen em relação ao investimento mensal contratado.', 10),
('q11', 'parceria', 'Parceria & Confiança', 'Segurança na Gestão de Verba', 'Nível de tranquilidade e confiança na forma responsável como seu orçamento de mídia é gerido.', 11),
('q12', 'parceria', 'Parceria & Confiança', 'Intenção de Renovação (Chave)', 'De 1 a 5, qual a sua intenção de renovação de contrato e continuidade com a Sotregen?', 12),
('q13', 'parceria', 'Parceria & Confiança', 'Recomendação (NPS)', 'Qual a probabilidade de você recomendar os serviços de tráfego pago da Sotregen para outros empresários?', 13)
ON CONFLICT (code) DO NOTHING;


-- 2. Tabela Principal de Respostas dos Clientes
CREATE TABLE IF NOT EXISTS sotregen_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    contact VARCHAR(100), -- WhatsApp ou E-mail

    -- 13 Perguntas Fechadas (Notas de 1 a 5)
    q1_comunicacao_clareza INT NOT NULL CHECK (q1_comunicacao_clareza BETWEEN 1 AND 5),
    q2_comunicacao_agilidade INT NOT NULL CHECK (q2_comunicacao_agilidade BETWEEN 1 AND 5),
    q3_comunicacao_proatividade INT NOT NULL CHECK (q3_comunicacao_proatividade BETWEEN 1 AND 5),
    
    q4_estrategia_compreensao INT NOT NULL CHECK (q4_estrategia_compreensao BETWEEN 1 AND 5),
    q5_estrategia_criativos INT NOT NULL CHECK (q5_estrategia_criativos BETWEEN 1 AND 5),
    q6_estrategia_testes INT NOT NULL CHECK (q6_estrategia_testes BETWEEN 1 AND 5),
    
    q7_desempenho_leads INT NOT NULL CHECK (q7_desempenho_leads BETWEEN 1 AND 5),
    q8_desempenho_roas INT NOT NULL CHECK (q8_desempenho_roas BETWEEN 1 AND 5),
    q9_desempenho_metas INT NOT NULL CHECK (q9_desempenho_metas BETWEEN 1 AND 5),
    
    q10_parceria_custo_beneficio INT NOT NULL CHECK (q10_parceria_custo_beneficio BETWEEN 1 AND 5),
    q11_parceria_seguranca_verba INT NOT NULL CHECK (q11_parceria_seguranca_verba BETWEEN 1 AND 5),
    q12_parceria_renovacao INT NOT NULL CHECK (q12_parceria_renovacao BETWEEN 1 AND 5),
    q13_parceria_recomendacao INT NOT NULL CHECK (q13_parceria_recomendacao BETWEEN 1 AND 5),

    -- 1 Pergunta Aberta
    comments TEXT,

    -- Colunas Calculadas (Médias)
    avg_comunicacao NUMERIC(3,2) GENERATED ALWAYS AS (
        ROUND((q1_comunicacao_clareza + q2_comunicacao_agilidade + q3_comunicacao_proatividade)::NUMERIC / 3.0, 2)
    ) STORED,
    avg_estrategia NUMERIC(3,2) GENERATED ALWAYS AS (
        ROUND((q4_estrategia_compreensao + q5_estrategia_criativos + q6_estrategia_testes)::NUMERIC / 3.0, 2)
    ) STORED,
    avg_desempenho NUMERIC(3,2) GENERATED ALWAYS AS (
        ROUND((q7_desempenho_leads + q8_desempenho_roas + q9_desempenho_metas)::NUMERIC / 3.0, 2)
    ) STORED,
    avg_parceria NUMERIC(3,2) GENERATED ALWAYS AS (
        ROUND((q10_parceria_custo_beneficio + q11_parceria_seguranca_verba + q12_parceria_recomendacao)::NUMERIC / 3.0, 2)
    ) STORED,
    avg_geral NUMERIC(3,2) GENERATED ALWAYS AS (
        ROUND((
            q1_comunicacao_clareza + q2_comunicacao_agilidade + q3_comunicacao_proatividade +
            q4_estrategia_compreensao + q5_estrategia_criativos + q6_estrategia_testes +
            q7_desempenho_leads + q8_desempenho_roas + q9_desempenho_metas +
            q10_parceria_custo_beneficio + q11_parceria_seguranca_verba + q12_parceria_recomendacao
        )::NUMERIC / 12.0, 2)
    ) STORED
);

-- Índices para otimização de consultas e relatórios
CREATE INDEX IF NOT EXISTS idx_sotregen_feedbacks_created_at ON sotregen_feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sotregen_feedbacks_company ON sotregen_feedbacks(company_name);

-- 3. View para Métricas Rápidas do Dashboard
CREATE OR REPLACE VIEW view_sotregen_dashboard_kpis AS
SELECT
    COUNT(*) AS total_respostas,
    ROUND(AVG(avg_geral), 2) AS csat_medio_geral,
    ROUND(AVG(avg_comunicacao), 2) AS media_comunicacao,
    ROUND(AVG(avg_estrategia), 2) AS media_estrategia,
    ROUND(AVG(avg_desempenho), 2) AS media_desempenho,
    ROUND(AVG(avg_parceria), 2) AS media_parceria,
    COUNT(CASE WHEN avg_geral >= 4.5 THEN 1 END) AS promotores,
    COUNT(CASE WHEN avg_geral >= 3.5 AND avg_geral < 4.5 THEN 1 END) AS neutros,
    COUNT(CASE WHEN avg_geral < 3.5 THEN 1 END) AS detratores
FROM sotregen_feedbacks;

-- 4. Exemplo de Políticas de Segurança (Row Level Security - RLS) para Supabase:
-- ALTER TABLE sotregen_feedbacks ENABLE ROW LEVEL SECURITY;
-- 
-- -- Permite que clientes públicos insiram avaliações pelo formulário:
-- CREATE POLICY "Permitir inserção pública de respostas"
-- ON sotregen_feedbacks FOR INSERT
-- TO public
-- WITH CHECK (true);
-- 
-- -- Permite apenas usuários autenticados (Admin da Sotregen) lerem as respostas:
-- CREATE POLICY "Apenas admin autenticado pode visualizar respostas"
-- ON sotregen_feedbacks FOR SELECT
-- TO authenticated
-- USING (true);
