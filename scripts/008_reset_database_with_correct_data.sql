-- Clear all existing data in correct order to avoid foreign key constraints
DELETE FROM evaluations;
DELETE FROM questions;
DELETE FROM blocks;
DELETE FROM projects;
DELETE FROM teams;
DELETE FROM judges;
DELETE FROM programs;

-- Reset sequences
ALTER SEQUENCE programs_id_seq RESTART WITH 1;
ALTER SEQUENCE teams_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE judges_id_seq RESTART WITH 1;
ALTER SEQUENCE blocks_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE evaluations_id_seq RESTART WITH 1;

-- Insert Programs
INSERT INTO programs (id, name, description, "createdAt", "updatedAt") VALUES
(1, 'Programa de Incubación', 'Programa enfocado en el desarrollo de startups en etapa temprana', NOW(), NOW()),
(2, 'Programa de Aceleración', 'Programa para startups en crecimiento que buscan escalar', NOW(), NOW());

-- Insert Teams for Incubación
INSERT INTO teams (id, name, "programId", "createdAt", "updatedAt") VALUES
(1, 'Cointable', 1, NOW(), NOW()),
(2, 'Enhanced Altruism Protocol', 1, NOW(), NOW()),
(3, 'Intezia', 1, NOW(), NOW()),
(4, 'Aqua Click', 1, NOW(), NOW()),
(5, 'Rial', 1, NOW(), NOW());

-- Insert Teams for Aceleración
INSERT INTO teams (id, name, "programId", "createdAt", "updatedAt") VALUES
(6, 'Tu Ratings', 2, NOW(), NOW()),
(7, 'Cercapp', 2, NOW(), NOW()),
(8, 'Tickea', 2, NOW(), NOW()),
(9, 'Conectados', 2, NOW(), NOW()),
(10, 'WaLinz', 2, NOW(), NOW());

-- Insert Projects for Incubación
INSERT INTO projects (id, name, description, "teamId", "programId", "createdAt", "updatedAt") VALUES
(1, 'Cointable', 'Plataforma de contabilidad digital para pequeñas empresas', 1, 1, NOW(), NOW()),
(2, 'Enhanced Altruism Protocol', 'Protocolo blockchain para donaciones transparentes y efectivas', 2, 1, NOW(), NOW()),
(3, 'Intezia', 'Solución de inteligencia artificial para optimización de procesos', 3, 1, NOW(), NOW()),
(4, 'Aqua Click', 'Aplicación para monitoreo y gestión del consumo de agua', 4, 1, NOW(), NOW()),
(5, 'Rial', 'Plataforma de pagos digitales para comercio local', 5, 1, NOW(), NOW());

-- Insert Projects for Aceleración
INSERT INTO projects (id, name, description, "teamId", "programId", "createdAt", "updatedAt") VALUES
(6, 'Tu Ratings', 'Sistema de calificaciones y reseñas para servicios locales', 6, 2, NOW(), NOW()),
(7, 'Cercapp', 'Aplicación de geolocalización para servicios de proximidad', 7, 2, NOW(), NOW()),
(8, 'Tickea', 'Plataforma de venta de tickets para eventos y espectáculos', 8, 2, NOW(), NOW()),
(9, 'Conectados', 'Red social para profesionales y networking empresarial', 9, 2, NOW(), NOW()),
(10, 'WaLinz', 'Solución de comunicación empresarial y colaboración', 10, 2, NOW(), NOW());

-- Insert Jurados nacionales (11 judges)
INSERT INTO judges (id, name, email, token, category, "createdAt", "updatedAt") VALUES
(1, 'Ivan Bohorquez', 'ivan.bohorquez@email.com', 'token_ivan_123', 'Jurados nacionales', NOW(), NOW()),
(2, 'Daniel Álvarez', 'daniel.alvarez@email.com', 'token_daniel_123', 'Jurados nacionales', NOW(), NOW()),
(3, 'Lorena Somoza', 'lorena.somoza@email.com', 'token_lorena_123', 'Jurados nacionales', NOW(), NOW()),
(4, 'Alberto Ramos', 'alberto.ramos@email.com', 'token_alberto_123', 'Jurados nacionales', NOW(), NOW()),
(5, 'Jorge García', 'jorge.garcia@email.com', 'token_jorge_123', 'Jurados nacionales', NOW(), NOW()),
(6, 'Carlos Navarro', 'carlos.navarro@email.com', 'token_carlos_123', 'Jurados nacionales', NOW(), NOW()),
(7, 'YANGO', 'yango@email.com', 'token_yango_123', 'Jurados nacionales', NOW(), NOW()),
(8, 'Sophia Kossman', 'sophia.kossman@email.com', 'token_sophia_123', 'Jurados nacionales', NOW(), NOW()),
(9, 'Juan González', 'juan.gonzalez@email.com', 'token_juan_123', 'Jurados nacionales', NOW(), NOW()),
(10, 'Julia Delgado', 'julia.delgado@email.com', 'token_julia_123', 'Jurados nacionales', NOW(), NOW()),
(11, 'Isaias Meza', 'isaias.meza@email.com', 'token_isaias_123', 'Jurados nacionales', NOW(), NOW());

-- Insert Jurado BDV (6 judges)
INSERT INTO judges (id, name, email, token, category, "createdAt", "updatedAt") VALUES
(12, 'Loyola Rosales (CME Marketing)', 'loyola.rosales@email.com', 'token_loyola_123', 'Jurado BDV', NOW(), NOW()),
(13, 'Alex Gómez (Innoven)', 'alex.gomez@email.com', 'token_alex_123', 'Jurado BDV', NOW(), NOW()),
(14, 'Luis Michel Jassir (Square One Capital)', 'luis.jassir@email.com', 'token_luis_123', 'Jurado BDV', NOW(), NOW()),
(15, 'Sandy Gómez (Arca Análisis)', 'sandy.gomez@email.com', 'token_sandy_123', 'Jurado BDV', NOW(), NOW()),
(16, 'Antonio Guerra (Enlaparada)', 'antonio.guerra@email.com', 'token_antonio_123', 'Jurado BDV', NOW(), NOW()),
(17, 'Pedro Berroteran (LEGA Abogados)', 'pedro.berroteran@email.com', 'token_pedro_123', 'Jurado BDV', NOW(), NOW());

-- Insert Jurados internacionales (5 judges)
INSERT INTO judges (id, name, email, token, category, "createdAt", "updatedAt") VALUES
(18, 'Iván Pérez', 'ivan.perez@email.com', 'token_ivanp_123', 'Jurados internacionales', NOW(), NOW()),
(19, 'Eleonora Coppola', 'eleonora.coppola@email.com', 'token_eleonora_123', 'Jurados internacionales', NOW(), NOW()),
(20, 'José Willington Ramírez', 'jose.ramirez@email.com', 'token_jose_123', 'Jurados internacionales', NOW(), NOW()),
(21, 'Alejandro Zotti', 'alejandro.zotti@email.com', 'token_alejandro_123', 'Jurados internacionales', NOW(), NOW()),
(22, 'Angelo Zambrano', 'angelo.zambrano@email.com', 'token_angelo_123', 'Jurados internacionales', NOW(), NOW());
