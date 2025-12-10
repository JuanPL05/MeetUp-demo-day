-- Clear all existing data and populate with new comprehensive dataset
-- Clear existing data in correct order (respecting foreign key constraints)
DELETE FROM evaluations;
DELETE FROM questions;
DELETE FROM blocks;
DELETE FROM projects;
DELETE FROM teams;
DELETE FROM judges;
DELETE FROM programs;

-- Add description column to questions if it doesn't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT;

-- Insert Programs
INSERT INTO programs (id, name, description, created_at, updated_at) VALUES
('prog_incubacion', 'Programa de Incubación', 'Programa para proyectos en etapa temprana', NOW(), NOW()),
('prog_aceleracion', 'Programa de Aceleración', 'Programa para proyectos con tracción', NOW(), NOW());

-- Insert Judge Categories and Judges
INSERT INTO judges (id, name, email, token, category, created_at, updated_at) VALUES
-- Jurados Nacionales
('judge_ivan_bohorquez', 'Ivan Bohorquez', 'ivan.bohorquez@email.com', 'token_ivan_123', 'Nacional', NOW(), NOW()),
('judge_daniel_alvarez', 'Daniel Álvarez', 'daniel.alvarez@email.com', 'token_daniel_123', 'Nacional', NOW(), NOW()),
('judge_lorena_somoza', 'Lorena Somoza', 'lorena.somoza@email.com', 'token_lorena_123', 'Nacional', NOW(), NOW()),
('judge_alberto_ramos', 'Alberto Ramos', 'alberto.ramos@email.com', 'token_alberto_123', 'Nacional', NOW(), NOW()),
('judge_jorge_garcia', 'Jorge García', 'jorge.garcia@email.com', 'token_jorge_123', 'Nacional', NOW(), NOW()),
('judge_carlos_navarro', 'Carlos Navarro', 'carlos.navarro@email.com', 'token_carlos_123', 'Nacional', NOW(), NOW()),
('judge_yango', 'YANGO', 'yango@email.com', 'token_yango_123', 'Nacional', NOW(), NOW()),
('judge_sophia_kossman', 'Sophia Kossman', 'sophia.kossman@email.com', 'token_sophia_123', 'Nacional', NOW(), NOW()),
('judge_juan_gonzalez', 'Juan González', 'juan.gonzalez@email.com', 'token_juan_123', 'Nacional', NOW(), NOW()),
('judge_julia_delgado', 'Julia Delgado', 'julia.delgado@email.com', 'token_julia_123', 'Nacional', NOW(), NOW()),
('judge_isaias_meza', 'Isaias Meza', 'isaias.meza@email.com', 'token_isaias_123', 'Nacional', NOW(), NOW()),

-- Jurado BDV
('judge_loyola_rosales', 'Loyola Rosales', 'loyola.rosales@email.com', 'token_loyola_123', 'BDV', NOW(), NOW()),
('judge_alex_gomez', 'Alex Gómez', 'alex.gomez@email.com', 'token_alex_123', 'BDV', NOW(), NOW()),
('judge_luis_jassir', 'Luis Michel Jassir', 'luis.jassir@email.com', 'token_luis_123', 'BDV', NOW(), NOW()),
('judge_sandy_gomez', 'Sandy Gómez', 'sandy.gomez@email.com', 'token_sandy_123', 'BDV', NOW(), NOW()),
('judge_antonio_guerra', 'Antonio Guerra', 'antonio.guerra@email.com', 'token_antonio_123', 'BDV', NOW(), NOW()),
('judge_pedro_berroteran', 'Pedro Berroteran', 'pedro.berroteran@email.com', 'token_pedro_123', 'BDV', NOW(), NOW()),

-- Jurados Internacionales
('judge_ivan_perez', 'Iván Perez', 'ivan.perez@email.com', 'token_ivanp_123', 'Internacional', NOW(), NOW()),
('judge_eleonora_coppola', 'Eleonora Coppola', 'eleonora.coppola@email.com', 'token_eleonora_123', 'Internacional', NOW(), NOW()),
('judge_jose_ramirez', 'José Willington Ramírez', 'jose.ramirez@email.com', 'token_jose_123', 'Internacional', NOW(), NOW()),
('judge_alejandro_zotti', 'Alejandro Zotti', 'alejandro.zotti@email.com', 'token_alejandro_123', 'Internacional', NOW(), NOW()),
('judge_angelo_zambrano', 'Angelo Zambrano', 'angelo.zambrano@email.com', 'token_angelo_123', 'Internacional', NOW(), NOW());

-- Insert Teams
INSERT INTO teams (id, name, created_at, updated_at) VALUES
-- Incubación Teams
('team_cointable', 'Equipo Cointable', NOW(), NOW()),
('team_enhanced_altruism', 'Equipo Enhanced Altruism Protocol', NOW(), NOW()),
('team_intezia', 'Equipo Intezia', NOW(), NOW()),
('team_aqua_click', 'Equipo Aqua Click', NOW(), NOW()),
('team_rial', 'Equipo Rial', NOW(), NOW()),

-- Aceleración Teams
('team_tu_ratings', 'Equipo Tu Ratings', NOW(), NOW()),
('team_cercapp', 'Equipo Cercapp', NOW(), NOW()),
('team_tickea', 'Equipo Tickea', NOW(), NOW()),
('team_conectados', 'Equipo Conectados', NOW(), NOW()),
('team_walinz', 'Equipo WaLinz', NOW(), NOW());

-- Insert Projects
INSERT INTO projects (id, name, description, team_id, program_id, created_at, updated_at) VALUES
-- Incubación Projects
('proj_cointable', 'Cointable', 'Proyecto de contabilidad digital', 'team_cointable', 'prog_incubacion', NOW(), NOW()),
('proj_enhanced_altruism', 'Enhanced Altruism Protocol', 'Protocolo de altruismo mejorado', 'team_enhanced_altruism', 'prog_incubacion', NOW(), NOW()),
('proj_intezia', 'Intezia', 'Plataforma de inteligencia artificial', 'team_intezia', 'prog_incubacion', NOW(), NOW()),
('proj_aqua_click', 'Aqua Click', 'Solución de gestión de agua', 'team_aqua_click', 'prog_incubacion', NOW(), NOW()),
('proj_rial', 'Rial', 'Plataforma financiera digital', 'team_rial', 'prog_incubacion', NOW(), NOW()),

-- Aceleración Projects
('proj_tu_ratings', 'Tu Ratings', 'Sistema de calificaciones y reseñas', 'team_tu_ratings', 'prog_aceleracion', NOW(), NOW()),
('proj_cercapp', 'Cercapp', 'Aplicación de proximidad y servicios', 'team_cercapp', 'prog_aceleracion', NOW(), NOW()),
('proj_tickea', 'Tickea', 'Plataforma de venta de tickets', 'team_tickea', 'prog_aceleracion', NOW(), NOW()),
('proj_conectados', 'Conectados', 'Red social de conexiones profesionales', 'team_conectados', 'prog_aceleracion', NOW(), NOW()),
('proj_walinz', 'WaLinz', 'Plataforma de enlaces y networking', 'team_walinz', 'prog_aceleracion', NOW(), NOW());

-- Insert Blocks for Incubación
INSERT INTO blocks (id, name, description, program_id, created_at, updated_at) VALUES
('block_inc_problema', 'Problema', 'Evaluación del problema identificado', 'prog_incubacion', NOW(), NOW()),
('block_inc_solucion', 'Solución', 'Evaluación de la solución propuesta', 'prog_incubacion', NOW(), NOW()),
('block_inc_mercado', 'Mercado', 'Análisis del mercado objetivo', 'prog_incubacion', NOW(), NOW()),
('block_inc_propuesta_valor', 'Propuesta de Valor', 'Evaluación de la propuesta de valor', 'prog_incubacion', NOW(), NOW()),
('block_inc_desarrollo', 'Estado del Desarrollo', 'Evaluación del estado de desarrollo', 'prog_incubacion', NOW(), NOW()),
('block_inc_equipo', 'Capacidad del Equipo', 'Evaluación de las capacidades del equipo', 'prog_incubacion', NOW(), NOW()),
('block_inc_proyeccion', 'Proyección y Visión', 'Evaluación de la proyección y visión', 'prog_incubacion', NOW(), NOW());

-- Insert Blocks for Aceleración
INSERT INTO blocks (id, name, description, program_id, created_at, updated_at) VALUES
('block_ace_traccion', 'Tracción', 'Evaluación de la tracción del negocio', 'prog_aceleracion', NOW(), NOW()),
('block_ace_rentabilidad', 'Rentabilidad', 'Evaluación de la rentabilidad', 'prog_aceleracion', NOW(), NOW()),
('block_ace_escalabilidad', 'Escalabilidad', 'Evaluación de la escalabilidad', 'prog_aceleracion', NOW(), NOW()),
('block_ace_propuesta_valor', 'Propuesta de Valor', 'Evaluación de la propuesta de valor', 'prog_aceleracion', NOW(), NOW()),
('block_ace_tecnologia', 'Uso de Tecnología / Innovación', 'Evaluación del uso de tecnología', 'prog_aceleracion', NOW(), NOW()),
('block_ace_vision', 'Visión Estratégica y Futuro', 'Evaluación de la visión estratégica', 'prog_aceleracion', NOW(), NOW()),
('block_ace_equipo', 'Capacidad del Equipo', 'Evaluación de las capacidades del equipo', 'prog_aceleracion', NOW(), NOW());

-- Insert Questions for Incubación
INSERT INTO questions (id, text, description, block_id, program_id, "order", created_at, updated_at) VALUES
-- Problema
('q_inc_problema_1', '¿El problema que abordan está claramente explicado?', 'Debe entenderse qué necesidad o vacío existe en el mercado.', 'block_inc_problema', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_problema_2', '¿Qué tan relevante o urgente parece ese problema para el público objetivo?', 'Evalúa si el problema tiene un impacto real o demanda actual.', 'block_inc_problema', 'prog_incubacion', 2, NOW(), NOW()),

-- Solución
('q_inc_solucion_1', '¿La solución propuesta es comprensible y lógica frente al problema?', 'Fíjate si hay coherencia entre problema y solución.', 'block_inc_solucion', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_solucion_2', '¿La propuesta presenta elementos innovadores o diferenciales?', 'Observa si hay algo único o distinto frente a otras soluciones.', 'block_inc_solucion', 'prog_incubacion', 2, NOW(), NOW()),

-- Mercado
('q_inc_mercado_1', '¿El mercado objetivo está bien identificado y definido?', 'Deben mencionar claramente su segmento de clientes.', 'block_inc_mercado', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_mercado_2', '¿Se percibe una oportunidad real de demanda o crecimiento en ese mercado?', 'Considera si hay espacio para que esta solución crezca.', 'block_inc_mercado', 'prog_incubacion', 2, NOW(), NOW()),

-- Propuesta de Valor
('q_inc_valor_1', '¿Es clara la ventaja competitiva de la propuesta?', '¿Qué hace que el proyecto sea único o difícil de copiar?', 'block_inc_propuesta_valor', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_valor_2', '¿La solución se diferencia suficientemente de las alternativas existentes?', 'Evalúa si conocen a sus competidores y tienen un punto fuerte.', 'block_inc_propuesta_valor', 'prog_incubacion', 2, NOW(), NOW()),

-- Estado del Desarrollo
('q_inc_desarrollo_1', '¿Hay evidencia de avances concretos en el desarrollo de la solución?', 'Prototipos, pilotos, pruebas o versiones iniciales.', 'block_inc_desarrollo', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_desarrollo_2', '¿Se entiende en qué etapa se encuentra el proyecto actualmente?', 'Fase: idea, validación, MVP, prueba, etc.', 'block_inc_desarrollo', 'prog_incubacion', 2, NOW(), NOW()),

-- Capacidad del Equipo
('q_inc_equipo_1', '¿El equipo demuestra tener habilidades técnicas mínimas para desarrollar la solución?', 'Evalúa su preparación en tecnología, producto, etc.', 'block_inc_equipo', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_equipo_2', '¿El equipo cuenta con capacidades comerciales o de gestión para avanzar?', '¿Saben cómo ejecutar, vender, presentar, organizar?', 'block_inc_equipo', 'prog_incubacion', 2, NOW(), NOW()),

-- Proyección y Visión
('q_inc_proyeccion_1', '¿El equipo tiene claridad sobre los próximos pasos a seguir?', 'Pregunta si identifican qué deben hacer o resolver.', 'block_inc_proyeccion', 'prog_incubacion', 1, NOW(), NOW()),
('q_inc_proyeccion_2', '¿Saben qué tipo de apoyo necesitan (inversión, mentoría, alianzas)?', 'Evalúa si tienen una meta o dirección clara.', 'block_inc_proyeccion', 'prog_incubacion', 2, NOW(), NOW());

-- Insert Questions for Aceleración
INSERT INTO questions (id, text, description, block_id, program_id, "order", created_at, updated_at) VALUES
-- Tracción
('q_ace_traccion_1', '¿Existen datos claros de ventas, contratos u otras métricas de crecimiento?', 'Evalúa si muestran números, validaciones, resultados.', 'block_ace_traccion', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_traccion_2', '¿Se percibe una tendencia de crecimiento o consolidación en su modelo?', 'Fíjate si el negocio está avanzando o estancado.', 'block_ace_traccion', 'prog_aceleracion', 2, NOW(), NOW()),

-- Rentabilidad
('q_ace_rentabilidad_1', '¿El modelo de negocio muestra ingresos consistentes o una estructura clara para generarlos?', '¿Tienen ingresos? ¿Saben cómo ganarán dinero?', 'block_ace_rentabilidad', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_rentabilidad_2', '¿Existe una ruta financiera clara hacia la rentabilidad en los próximos 18 meses?', 'Considera planes, proyecciones o eficiencia del modelo.', 'block_ace_rentabilidad', 'prog_aceleracion', 2, NOW(), NOW()),

-- Escalabilidad
('q_ace_escalabilidad_1', '¿El negocio puede crecer a otros mercados, regiones o segmentos?', 'Evalúa si hay un plan o visión más allá de lo actual.', 'block_ace_escalabilidad', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_escalabilidad_2', '¿Los procesos, equipo y estructura permiten escalar sin perder eficiencia?', 'Fíjate en la preparación para crecer sin colapsar.', 'block_ace_escalabilidad', 'prog_aceleracion', 2, NOW(), NOW()),

-- Propuesta de Valor
('q_ace_valor_1', '¿El producto o servicio tiene atributos diferenciadores frente a la competencia?', '¿Por qué alguien debería preferirlos?', 'block_ace_propuesta_valor', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_valor_2', '¿Esa ventaja competitiva es difícil de replicar o mantener en el tiempo?', 'Evalúa si pueden sostener esa ventaja.', 'block_ace_propuesta_valor', 'prog_aceleracion', 2, NOW(), NOW()),

-- Uso de Tecnología / Innovación
('q_ace_tecnologia_1', '¿El negocio aplica tecnologías o metodologías innovadoras en su operación o propuesta?', 'Herramientas digitales, técnicas, nuevos modelos.', 'block_ace_tecnologia', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_tecnologia_2', '¿La innovación mejora significativamente algún proceso, producto o experiencia del cliente?', 'Impacto real de lo innovador.', 'block_ace_tecnologia', 'prog_aceleracion', 2, NOW(), NOW()),

-- Visión Estratégica y Futuro
('q_ace_vision_1', '¿El equipo identifica claramente sus áreas de mejora o expansión?', 'Evalúa si tienen autodiagnóstico y foco.', 'block_ace_vision', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_vision_2', '¿Saben cómo podrían aprovechar inversión o acompañamiento externo?', '¿Tienen claridad de para qué usarían los recursos?', 'block_ace_vision', 'prog_aceleracion', 2, NOW(), NOW()),

-- Capacidad del Equipo
('q_ace_equipo_1', '¿El equipo tiene experiencia comprobable para ejecutar y escalar el negocio?', 'Considera su trayectoria, logros o experticia.', 'block_ace_equipo', 'prog_aceleracion', 1, NOW(), NOW()),
('q_ace_equipo_2', '¿Se percibe liderazgo, enfoque y cohesión en el equipo fundador?', 'Evalúa si trabajan bien juntos y tienen dirección.', 'block_ace_equipo', 'prog_aceleracion', 2, NOW(), NOW());
