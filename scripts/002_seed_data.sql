-- Seed data for Pitch Day evaluation app

-- Insert Programs
INSERT INTO programs (id, name, description) VALUES 
('prog_incubation', 'Programa de Incubación', 'Programa para startups en etapa temprana'),
('prog_acceleration', 'Programa de Aceleración', 'Programa para startups en crecimiento')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks
INSERT INTO blocks (id, name, description, "order") VALUES 
('block_innovation', 'Innovación', 'Evaluación de la innovación del proyecto', 1),
('block_market', 'Mercado', 'Análisis del mercado y oportunidad', 2),
('block_team', 'Equipo', 'Evaluación del equipo fundador', 3),
('block_business', 'Modelo de Negocio', 'Viabilidad del modelo de negocio', 4),
('block_financial', 'Financiero', 'Proyecciones y viabilidad financiera', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert Questions
INSERT INTO questions (id, text, "blockId", "order") VALUES 
-- Innovation Block
('q_innovation_1', '¿Qué tan innovadora es la solución propuesta?', 'block_innovation', 1),
('q_innovation_2', '¿El proyecto resuelve un problema real y significativo?', 'block_innovation', 2),
('q_innovation_3', '¿Qué tan diferenciada es la propuesta de valor?', 'block_innovation', 3),

-- Market Block
('q_market_1', '¿Qué tan grande es el mercado objetivo?', 'block_market', 1),
('q_market_2', '¿El equipo comprende bien su mercado?', 'block_market', 2),
('q_market_3', '¿Existe tracción o validación del mercado?', 'block_market', 3),

-- Team Block
('q_team_1', '¿El equipo tiene las competencias necesarias?', 'block_team', 1),
('q_team_2', '¿Qué tan comprometido está el equipo?', 'block_team', 2),
('q_team_3', '¿El equipo tiene experiencia relevante?', 'block_team', 3),

-- Business Model Block
('q_business_1', '¿El modelo de negocio es claro y viable?', 'block_business', 1),
('q_business_2', '¿Las fuentes de ingresos están bien definidas?', 'block_business', 2),
('q_business_3', '¿La estrategia de go-to-market es sólida?', 'block_business', 3),

-- Financial Block
('q_financial_1', '¿Las proyecciones financieras son realistas?', 'block_financial', 1),
('q_financial_2', '¿El proyecto tiene potencial de escalabilidad?', 'block_financial', 2),
('q_financial_3', '¿Los requerimientos de inversión son apropiados?', 'block_financial', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Teams
INSERT INTO teams (id, name, description) VALUES 
('team_techstars', 'TechStars', 'Startup de tecnología educativa'),
('team_greentech', 'GreenTech Solutions', 'Soluciones tecnológicas sostenibles'),
('team_healthai', 'HealthAI', 'Inteligencia artificial para salud'),
('team_fintech', 'FinTech Pro', 'Servicios financieros digitales'),
('team_agritech', 'AgriTech Innovation', 'Tecnología para agricultura')
ON CONFLICT (id) DO NOTHING;

-- Insert Projects
INSERT INTO projects (id, name, description, "programId", "teamId") VALUES 
('proj_edutech', 'EduTech Platform', 'Plataforma de aprendizaje personalizado', 'prog_incubation', 'team_techstars'),
('proj_carbon', 'Carbon Tracker', 'Sistema de monitoreo de huella de carbono', 'prog_acceleration', 'team_greentech'),
('proj_diagnosis', 'AI Diagnosis', 'Diagnóstico médico asistido por IA', 'prog_incubation', 'team_healthai'),
('proj_payments', 'Smart Payments', 'Sistema de pagos inteligente', 'prog_acceleration', 'team_fintech'),
('proj_farming', 'Smart Farming', 'IoT para agricultura inteligente', 'prog_incubation', 'team_agritech')
ON CONFLICT (id) DO NOTHING;

-- Insert Judges
INSERT INTO judges (id, name, email, token) VALUES 
('judge_maria', 'María González', 'maria@judges.com', 'token_maria_123'),
('judge_carlos', 'Carlos Rodríguez', 'carlos@judges.com', 'token_carlos_456'),
('judge_ana', 'Ana Martínez', 'ana@judges.com', 'token_ana_789'),
('judge_luis', 'Luis Fernández', 'luis@judges.com', 'token_luis_012')
ON CONFLICT (id) DO NOTHING;
