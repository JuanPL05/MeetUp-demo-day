-- Complete database reset and seed with new comprehensive data
-- Clear all existing data in correct order to avoid foreign key constraints

DELETE FROM evaluations;
DELETE FROM questions;
DELETE FROM blocks;
DELETE FROM projects;
DELETE FROM teams;
DELETE FROM judges;
DELETE FROM programs;

-- Insert Programs
INSERT INTO programs (id, name, description) VALUES
('prog_incubacion', 'Programa de Incubación', 'Programa enfocado en startups en etapa temprana que necesitan validar su modelo de negocio'),
('prog_aceleracion', 'Programa de Aceleración', 'Programa para startups con tracción que buscan escalar y crecer rápidamente');

-- Insert Teams
INSERT INTO teams (id, name, "programId") VALUES
('team_cointable', 'Cointable', 'prog_incubacion'),
('team_altruismo', 'Protocolo de Altruismo Mejorado', 'prog_incubacion'),
('team_intezia', 'Intezia', 'prog_incubacion'),
('team_aquaclick', 'Aqua Click', 'prog_incubacion'),
('team_rial', 'Rial', 'prog_incubacion'),
('team_turatings', 'Tu Ratings', 'prog_aceleracion'),
('team_cercapp', 'Cercapp', 'prog_aceleracion'),
('team_tickea', 'Tickea', 'prog_aceleracion'),
('team_conectados', 'Conectados', 'prog_aceleracion'),
('team_walinz', 'WaLinz', 'prog_aceleracion');

-- Insert Projects
INSERT INTO projects (id, name, description, "teamId", "programId") VALUES
('proj_cointable', 'Cointable', 'Plataforma de contabilidad digital para pequeñas empresas', 'team_cointable', 'prog_incubacion'),
('proj_altruismo', 'Protocolo de Altruismo Mejorado', 'Sistema para optimizar donaciones y acciones altruistas', 'team_altruismo', 'prog_incubacion'),
('proj_intezia', 'Intezia', 'Solución de inteligencia artificial para análisis de datos', 'team_intezia', 'prog_incubacion'),
('proj_aquaclick', 'Aqua Click', 'Aplicación para gestión eficiente del consumo de agua', 'team_aquaclick', 'prog_incubacion'),
('proj_rial', 'Rial', 'Plataforma de pagos digitales para comercio local', 'team_rial', 'prog_incubacion'),
('proj_turatings', 'Tu Ratings', 'Sistema de calificaciones y reseñas para servicios', 'team_turatings', 'prog_aceleracion'),
('proj_cercapp', 'Cercapp', 'Aplicación de geolocalización para servicios cercanos', 'team_cercapp', 'prog_aceleracion'),
('proj_tickea', 'Tickea', 'Plataforma de venta de tickets para eventos', 'team_tickea', 'prog_aceleracion'),
('proj_conectados', 'Conectados', 'Red social para profesionales y networking', 'team_conectados', 'prog_aceleracion'),
('proj_walinz', 'WaLinz', 'Solución de logística y delivery inteligente', 'team_walinz', 'prog_aceleracion');

-- Insert Judges with categories
INSERT INTO judges (id, name, email, token, category) VALUES
-- Jurados nacionales
('judge_ivan_bohorquez', 'Ivan Bohorquez', 'ivan.bohorquez@email.com', 'token_ivan_123', 'Jurados nacionales'),
('judge_daniel_alvarez', 'Daniel Álvarez', 'daniel.alvarez@email.com', 'token_daniel_123', 'Jurados nacionales'),
('judge_lorena_somoza', 'Lorena Somoza', 'lorena.somoza@email.com', 'token_lorena_123', 'Jurados nacionales'),
('judge_alberto_ramos', 'Alberto Ramos', 'alberto.ramos@email.com', 'token_alberto_123', 'Jurados nacionales'),
('judge_jorge_garcia', 'Jorge García', 'jorge.garcia@email.com', 'token_jorge_123', 'Jurados nacionales'),
('judge_carlos_navarro', 'Carlos Navarro', 'carlos.navarro@email.com', 'token_carlos_123', 'Jurados nacionales'),
('judge_yango', 'YANGO', 'yango@email.com', 'token_yango_123', 'Jurados nacionales'),
('judge_sophia_kossman', 'Sophia Kossman', 'sophia.kossman@email.com', 'token_sophia_123', 'Jurados nacionales'),
('judge_juan_gonzalez', 'Juan González', 'juan.gonzalez@email.com', 'token_juan_123', 'Jurados nacionales'),
('judge_julia_delgado', 'Julia Delgado', 'julia.delgado@email.com', 'token_julia_123', 'Jurados nacionales'),
('judge_isaias_meza', 'Isaias Meza', 'isaias.meza@email.com', 'token_isaias_123', 'Jurados nacionales'),

-- Jurado BDV
('judge_loyola_rosales', 'Loyola Rosales (CME Marketing)', 'loyola.rosales@email.com', 'token_loyola_123', 'Jurado BDV'),
('judge_alex_gomez', 'Alex Gómez (Innoven)', 'alex.gomez@email.com', 'token_alex_123', 'Jurado BDV'),
('judge_luis_jassir', 'Luis Michel Jassir (Square One Capital)', 'luis.jassir@email.com', 'token_luis_123', 'Jurado BDV'),
('judge_sandy_gomez', 'Sandy Gómez (Arca Análisis)', 'sandy.gomez@email.com', 'token_sandy_123', 'Jurado BDV'),
('judge_antonio_guerra', 'Antonio Guerra (Enlaparada)', 'antonio.guerra@email.com', 'token_antonio_123', 'Jurado BDV'),
('judge_pedro_berroteran', 'Pedro Berroteran (LEGA Abogados)', 'pedro.berroteran@email.com', 'token_pedro_123', 'Jurado BDV'),

-- Jurados internacionales
('judge_ivan_perez', 'Iván Pérez', 'ivan.perez@email.com', 'token_ivanp_123', 'Jurados internacionales'),
('judge_eleonora_coppola', 'Eleonora Coppola', 'eleonora.coppola@email.com', 'token_eleonora_123', 'Jurados internacionales'),
('judge_jose_ramirez', 'José Willington Ramírez', 'jose.ramirez@email.com', 'token_jose_123', 'Jurados internacionales'),
('judge_alejandro_zotti', 'Alejandro Zotti', 'alejandro.zotti@email.com', 'token_alejandro_123', 'Jurados internacionales'),
('judge_angelo_zambrano', 'Angelo Zambrano', 'angelo.zambrano@email.com', 'token_angelo_123', 'Jurados internacionales');

-- Insert Blocks for Incubación
INSERT INTO blocks (id, name, description, "programId") VALUES
('block_inc_problema', 'Problema', 'Evaluación de la identificación y relevancia del problema', 'prog_incubacion'),
('block_inc_solucion', 'Solución', 'Análisis de la propuesta de solución y su innovación', 'prog_incubacion'),
('block_inc_mercado', 'Mercado', 'Evaluación del mercado objetivo y oportunidades', 'prog_incubacion'),
('block_inc_propuesta', 'Propuesta de Valor', 'Análisis de la ventaja competitiva y diferenciación', 'prog_incubacion'),
('block_inc_desarrollo', 'Estado del Desarrollo', 'Evaluación del progreso y etapa actual del proyecto', 'prog_incubacion'),
('block_inc_equipo', 'Capacidad del Equipo', 'Análisis de las habilidades y capacidades del equipo', 'prog_incubacion'),
('block_inc_vision', 'Proyección y Visión', 'Evaluación de la claridad en próximos pasos y necesidades', 'prog_incubacion');

-- Insert Blocks for Aceleración
INSERT INTO blocks (id, name, description, "programId") VALUES
('block_ace_traccion', 'Tracción', 'Evaluación de métricas de crecimiento y validación', 'prog_aceleracion'),
('block_ace_rentabilidad', 'Rentabilidad', 'Análisis del modelo de negocio y generación de ingresos', 'prog_aceleracion'),
('block_ace_escalabilidad', 'Escalabilidad', 'Evaluación de la capacidad de crecimiento y expansión', 'prog_aceleracion'),
('block_ace_propuesta', 'Propuesta de Valor', 'Análisis de diferenciación y ventaja competitiva sostenible', 'prog_aceleracion'),
('block_ace_tecnologia', 'Uso de Tecnología / Innovación', 'Evaluación de la aplicación de tecnologías innovadoras', 'prog_aceleracion'),
('block_ace_vision', 'Visión Estratégica y Futuro', 'Análisis de la estrategia y aprovechamiento de recursos', 'prog_aceleracion'),
('block_ace_equipo', 'Capacidad del Equipo', 'Evaluación de la experiencia y liderazgo del equipo', 'prog_aceleracion');

-- Insert Questions for Incubación
INSERT INTO questions (id, text, description, "blockId", "programId") VALUES
-- Problema
('q_inc_problema_1', '¿El problema que abordan está claramente explicado?', 'Debe entenderse qué necesidad o vacío existe en el mercado.', 'block_inc_problema', 'prog_incubacion'),
('q_inc_problema_2', '¿Qué tan relevante o urgente parece ese problema para el público objetivo?', 'Evalúa si el problema tiene un impacto real o demanda actual.', 'block_inc_problema', 'prog_incubacion'),

-- Solución
('q_inc_solucion_1', '¿La solución propuesta es comprensible y lógica frente al problema?', 'Fíjate si hay coherencia entre problema y solución.', 'block_inc_solucion', 'prog_incubacion'),
('q_inc_solucion_2', '¿La propuesta presenta elementos innovadores o diferenciales?', 'Observa si hay algo único o distinto frente a otras soluciones.', 'block_inc_solucion', 'prog_incubacion'),

-- Mercado
('q_inc_mercado_1', '¿El mercado objetivo está bien identificado y definido?', 'Deben mencionar claramente su segmento de clientes.', 'block_inc_mercado', 'prog_incubacion'),
('q_inc_mercado_2', '¿Se percibe una oportunidad real de demanda o crecimiento en ese mercado?', 'Considera si hay espacio para que esta solución crezca.', 'block_inc_mercado', 'prog_incubacion'),

-- Propuesta de Valor
('q_inc_propuesta_1', '¿Es clara la ventaja competitiva de la propuesta?', '¿Qué hace que el proyecto sea único o difícil de copiar?', 'block_inc_propuesta', 'prog_incubacion'),
('q_inc_propuesta_2', '¿La solución se diferencia suficientemente de las alternativas existentes?', 'Evalúa si conocen a sus competidores y tienen un punto fuerte.', 'block_inc_propuesta', 'prog_incubacion'),

-- Estado del Desarrollo
('q_inc_desarrollo_1', '¿Hay evidencia de avances concretos en el desarrollo de la solución?', 'Prototipos, pilotos, pruebas o versiones iniciales.', 'block_inc_desarrollo', 'prog_incubacion'),
('q_inc_desarrollo_2', '¿Se entiende en qué etapa se encuentra el proyecto actualmente?', 'Fase: idea, validación, MVP, prueba, etc.', 'block_inc_desarrollo', 'prog_incubacion'),

-- Capacidad del Equipo
('q_inc_equipo_1', '¿El equipo demuestra tener habilidades técnicas mínimas para desarrollar la solución?', 'Evalúa su preparación en tecnología, producto, etc.', 'block_inc_equipo', 'prog_incubacion'),
('q_inc_equipo_2', '¿El equipo cuenta con capacidades comerciales o de gestión para avanzar?', '¿Saben cómo ejecutar, vender, presentar, organizar?', 'block_inc_equipo', 'prog_incubacion'),

-- Proyección y Visión
('q_inc_vision_1', '¿El equipo tiene claridad sobre los próximos pasos a seguir?', 'Pregunta si identifican qué deben hacer o resolver.', 'block_inc_vision', 'prog_incubacion'),
('q_inc_vision_2', '¿Saben qué tipo de apoyo necesitan (inversión, mentoría, alianzas)?', 'Evalúa si tienen una meta o dirección clara.', 'block_inc_vision', 'prog_incubacion');

-- Insert Questions for Aceleración
INSERT INTO questions (id, text, description, "blockId", "programId") VALUES
-- Tracción
('q_ace_traccion_1', '¿Existen datos claros de ventas, contratos u otras métricas de crecimiento?', 'Evalúa si muestran números, validaciones, resultados.', 'block_ace_traccion', 'prog_aceleracion'),
('q_ace_traccion_2', '¿Se percibe una tendencia de crecimiento o consolidación en su modelo?', 'Fíjate si el negocio está avanzando o estancado.', 'block_ace_traccion', 'prog_aceleracion'),

-- Rentabilidad
('q_ace_rentabilidad_1', '¿El modelo de negocio muestra ingresos consistentes o una estructura clara para generarlos?', '¿Tienen ingresos? ¿Saben cómo ganarán dinero?', 'block_ace_rentabilidad', 'prog_aceleracion'),
('q_ace_rentabilidad_2', '¿Existe una ruta financiera clara hacia la rentabilidad en los próximos 18 meses?', 'Considera planes, proyecciones o eficiencia del modelo.', 'block_ace_rentabilidad', 'prog_aceleracion'),

-- Escalabilidad
('q_ace_escalabilidad_1', '¿El negocio puede crecer a otros mercados, regiones o segmentos?', 'Evalúa si hay un plan o visión más allá de lo actual.', 'block_ace_escalabilidad', 'prog_aceleracion'),
('q_ace_escalabilidad_2', '¿Los procesos, equipo y estructura permiten escalar sin perder eficiencia?', 'Fíjate en la preparación para crecer sin colapsar.', 'block_ace_escalabilidad', 'prog_aceleracion'),

-- Propuesta de Valor
('q_ace_propuesta_1', '¿El producto o servicio tiene atributos diferenciadores frente a la competencia?', '¿Por qué alguien debería preferirlos?', 'block_ace_propuesta', 'prog_aceleracion'),
('q_ace_propuesta_2', '¿Esa ventaja competitiva es difícil de replicar o mantener en el tiempo?', 'Evalúa si pueden sostener esa ventaja.', 'block_ace_propuesta', 'prog_aceleracion'),

-- Uso de Tecnología / Innovación
('q_ace_tecnologia_1', '¿El negocio aplica tecnologías o metodologías innovadoras en su operación o propuesta?', 'Herramientas digitales, técnicas, nuevos modelos.', 'block_ace_tecnologia', 'prog_aceleracion'),
('q_ace_tecnologia_2', '¿La innovación mejora significativamente algún proceso, producto o experiencia del cliente?', 'Impacto real de lo innovador.', 'block_ace_tecnologia', 'prog_aceleracion'),

-- Visión Estratégica y Futuro
('q_ace_vision_1', '¿El equipo identifica claramente sus áreas de mejora o expansión?', 'Evalúa si tienen autodiagnóstico y foco.', 'block_ace_vision', 'prog_aceleracion'),
('q_ace_vision_2', '¿Saben cómo podrían aprovechar inversión o acompañamiento externo?', '¿Tienen claridad de para qué usarían los recursos?', 'block_ace_vision', 'prog_aceleracion'),

-- Capacidad del Equipo
('q_ace_equipo_1', '¿El equipo tiene experiencia comprobable para ejecutar y escalar el negocio?', 'Considera su trayectoria, logros o experticia.', 'block_ace_equipo', 'prog_aceleracion'),
('q_ace_equipo_2', '¿Se percibe liderazgo, enfoque y cohesión en el equipo fundador?', 'Evalúa si trabajan bien juntos y tienen dirección.', 'block_ace_equipo', 'prog_aceleracion');
