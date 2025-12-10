-- Clear all existing data
TRUNCATE TABLE evaluations CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE blocks CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE teams CASCADE;
TRUNCATE TABLE judges CASCADE;
TRUNCATE TABLE programs CASCADE;

-- Reset sequences
ALTER SEQUENCE programs_id_seq RESTART WITH 1;
ALTER SEQUENCE teams_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE judges_id_seq RESTART WITH 1;
ALTER SEQUENCE blocks_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE evaluations_id_seq RESTART WITH 1;

-- Insert Programs
INSERT INTO programs (name, description) VALUES
('Programa de Incubación', 'Programa enfocado en el desarrollo temprano de startups'),
('Programa de Aceleración', 'Programa para startups en etapa de crecimiento y escalamiento');

-- Insert Teams
INSERT INTO teams (name) VALUES
('Cointable'),
('Enhanced Altruism Protocol'),
('Intezia'),
('Aqua Click'),
('Rial'),
('Tu Ratings'),
('Cercapp'),
('Tickea'),
('Conectados'),
('WaLinz');

-- Insert Projects
INSERT INTO projects (name, description, "programId", "teamId") VALUES
('Cointable', 'Proyecto de contabilidad digital', 1, 1),
('Enhanced Altruism Protocol', 'Protocolo de altruismo mejorado', 1, 2),
('Intezia', 'Plataforma de inteligencia artificial', 1, 3),
('Aqua Click', 'Solución de gestión de agua', 1, 4),
('Rial', 'Sistema de pagos digitales', 1, 5),
('Tu Ratings', 'Plataforma de calificaciones', 2, 6),
('Cercapp', 'Aplicación de proximidad', 2, 7),
('Tickea', 'Sistema de ticketing', 2, 8),
('Conectados', 'Red social empresarial', 2, 9),
('WaLinz', 'Plataforma de enlaces', 2, 10);

-- Insert Judges
INSERT INTO judges (name, email, token, category) VALUES
-- Jurados nacionales
('Ivan Bohorquez', 'ivan.bohorquez@email.com', 'token_ivan_123', 'Nacional'),
('Daniel Álvarez', 'daniel.alvarez@email.com', 'token_daniel_123', 'Nacional'),
('Lorena Somoza', 'lorena.somoza@email.com', 'token_lorena_123', 'Nacional'),
('Alberto Ramos', 'alberto.ramos@email.com', 'token_alberto_123', 'Nacional'),
('Jorge García', 'jorge.garcia@email.com', 'token_jorge_123', 'Nacional'),
('Carlos Navarro', 'carlos.navarro@email.com', 'token_carlos_123', 'Nacional'),
('YANGO', 'yango@email.com', 'token_yango_123', 'Nacional'),
('Sophia Kossman', 'sophia.kossman@email.com', 'token_sophia_123', 'Nacional'),
('Juan González', 'juan.gonzalez@email.com', 'token_juan_123', 'Nacional'),
('Julia Delgado', 'julia.delgado@email.com', 'token_julia_123', 'Nacional'),
('Isaias Meza', 'isaias.meza@email.com', 'token_isaias_123', 'Nacional'),

-- Jurado BDV
('Loyola Rosales', 'loyola.rosales@email.com', 'token_loyola_123', 'BDV'),
('Alex Gómez', 'alex.gomez@email.com', 'token_alex_123', 'BDV'),
('Luis Michel Jassir', 'luis.jassir@email.com', 'token_luis_123', 'BDV'),
('Sandy Gómez', 'sandy.gomez@email.com', 'token_sandy_123', 'BDV'),
('Antonio Guerra', 'antonio.guerra@email.com', 'token_antonio_123', 'BDV'),
('Pedro Berroteran', 'pedro.berroteran@email.com', 'token_pedro_123', 'BDV'),

-- Jurados internacionales
('Iván Perez', 'ivan.perez@email.com', 'token_ivanp_123', 'Internacional'),
('Eleonora Coppola', 'eleonora.coppola@email.com', 'token_eleonora_123', 'Internacional'),
('José Willington Ramírez', 'jose.ramirez@email.com', 'token_jose_123', 'Internacional'),
('Alejandro Zotti', 'alejandro.zotti@email.com', 'token_alejandro_123', 'Internacional'),
('Angelo Zambrano', 'angelo.zambrano@email.com', 'token_angelo_123', 'Internacional');

-- Insert Blocks for Incubación
INSERT INTO blocks (name, description, "order", "programId") VALUES
('Problema y Solución', 'Evaluación del problema identificado y la solución propuesta', 1, 1),
('Mercado y Competencia', 'Análisis del mercado objetivo y competencia', 2, 1),
('Modelo de Negocio', 'Evaluación del modelo de negocio y estrategia de monetización', 3, 1),
('Equipo', 'Evaluación del equipo fundador y sus capacidades', 4, 1),
('Producto y Tecnología', 'Evaluación del producto y aspectos tecnológicos', 5, 1);

-- Insert Blocks for Aceleración
INSERT INTO blocks (name, description, "order", "programId") VALUES
('Tracción y Métricas', 'Evaluación de la tracción del negocio y métricas clave', 1, 2),
('Escalabilidad', 'Capacidad de escalamiento del negocio', 2, 2),
('Financiamiento', 'Estrategia de financiamiento y uso de recursos', 3, 2),
('Expansión', 'Plan de expansión y crecimiento', 4, 2),
('Impacto', 'Impacto social y económico del proyecto', 5, 2);

-- Insert Questions for Incubación
INSERT INTO questions (text, description, "blockId", "programId") VALUES
-- Problema y Solución
('¿El problema está claramente definido y es relevante?', 'Evaluar si el problema identificado es real, específico y tiene un impacto significativo en el mercado objetivo.', 1, 1),
('¿La solución propuesta es innovadora y viable?', 'Determinar si la solución es original, factible técnicamente y puede implementarse con los recursos disponibles.', 1, 1),
('¿Existe una propuesta de valor clara y diferenciada?', 'Verificar que la propuesta de valor sea comprensible, única y genere beneficios tangibles para los usuarios.', 1, 1),

-- Mercado y Competencia
('¿El mercado objetivo está bien definido y es suficientemente grande?', 'Evaluar si el mercado objetivo es específico, medible y tiene el tamaño adecuado para sostener el negocio.', 2, 1),
('¿Se ha realizado un análisis competitivo adecuado?', 'Verificar que se hayan identificado competidores directos e indirectos y se comprenda el panorama competitivo.', 2, 1),
('¿La estrategia de entrada al mercado es realista?', 'Evaluar si la estrategia para ingresar al mercado es factible y está alineada con los recursos disponibles.', 2, 1),

-- Modelo de Negocio
('¿El modelo de negocio es claro y sostenible?', 'Verificar que el modelo de negocio sea comprensible, tenga múltiples fuentes de ingresos y sea sostenible a largo plazo.', 3, 1),
('¿Las proyecciones financieras son realistas?', 'Evaluar si las proyecciones de ingresos, costos y crecimiento están basadas en supuestos razonables.', 3, 1),
('¿Se han identificado los principales riesgos y mitigaciones?', 'Verificar que se hayan identificado los riesgos más importantes y se tengan estrategias para mitigarlos.', 3, 1),

-- Equipo
('¿El equipo tiene las competencias necesarias?', 'Evaluar si el equipo fundador posee las habilidades técnicas, comerciales y de liderazgo necesarias.', 4, 1),
('¿Existe complementariedad entre los miembros del equipo?', 'Verificar que los miembros del equipo se complementen en habilidades y experiencia.', 4, 1),
('¿El equipo demuestra compromiso y dedicación?', 'Evaluar el nivel de compromiso y dedicación del equipo con el proyecto.', 4, 1),

-- Producto y Tecnología
('¿El producto tiene un desarrollo técnico sólido?', 'Evaluar la calidad técnica del producto, su arquitectura y escalabilidad tecnológica.', 5, 1),
('¿Se ha validado el producto con usuarios reales?', 'Verificar que se hayan realizado pruebas con usuarios reales y se haya obtenido retroalimentación valiosa.', 5, 1),
('¿La propiedad intelectual está protegida adecuadamente?', 'Evaluar si se han tomado las medidas necesarias para proteger la propiedad intelectual del proyecto.', 5, 1);

-- Insert Questions for Aceleración
INSERT INTO questions (text, description, "blockId", "programId") VALUES
-- Tracción y Métricas
('¿Las métricas de tracción demuestran crecimiento sostenido?', 'Evaluar si las métricas clave (usuarios, ingresos, retención) muestran un crecimiento consistente y sostenible.', 6, 2),
('¿Los indicadores financieros son positivos?', 'Verificar que los indicadores financieros (ingresos, márgenes, flujo de caja) muestren una tendencia positiva.', 6, 2),
('¿Se han establecido KPIs relevantes y se monitorean regularmente?', 'Evaluar si se han definido indicadores clave de rendimiento apropiados y se realiza un seguimiento constante.', 6, 2),

-- Escalabilidad
('¿El modelo de negocio es escalable?', 'Determinar si el modelo de negocio puede crecer significativamente sin incrementos proporcionales en costos.', 7, 2),
('¿La infraestructura tecnológica soporta el crecimiento?', 'Evaluar si la arquitectura tecnológica puede manejar un aumento significativo en usuarios y transacciones.', 7, 2),
('¿Se han identificado los recursos necesarios para escalar?', 'Verificar que se hayan identificado los recursos humanos, tecnológicos y financieros necesarios para el crecimiento.', 7, 2),

-- Financiamiento
('¿La estrategia de financiamiento es adecuada?', 'Evaluar si la estrategia de financiamiento está alineada con las necesidades y etapa del negocio.', 8, 2),
('¿El uso de fondos está claramente planificado?', 'Verificar que exista un plan detallado y realista sobre cómo se utilizarán los recursos financieros.', 8, 2),
('¿Se han explorado múltiples fuentes de financiamiento?', 'Evaluar si se han considerado diversas opciones de financiamiento (inversores, grants, deuda, etc.).', 8, 2),

-- Expansión
('¿Existe un plan de expansión claro y factible?', 'Evaluar si el plan de expansión es específico, realista y está basado en datos del mercado.', 9, 2),
('¿Se han identificado nuevos mercados o segmentos?', 'Verificar que se hayan identificado oportunidades de expansión a nuevos mercados o segmentos de clientes.', 9, 2),
('¿La expansión está alineada con la capacidad operativa?', 'Evaluar si los planes de expansión son coherentes con la capacidad operativa y recursos disponibles.', 9, 2),

-- Impacto
('¿El proyecto genera un impacto social positivo?', 'Evaluar si el proyecto contribuye positivamente a la sociedad y aborda problemas sociales relevantes.', 10, 2),
('¿Se mide y reporta el impacto generado?', 'Verificar que existan métricas para medir el impacto social y económico, y se reporte regularmente.', 10, 2),
('¿El impacto es sostenible a largo plazo?', 'Evaluar si el impacto generado puede mantenerse y crecer de manera sostenible en el tiempo.', 10, 2);
