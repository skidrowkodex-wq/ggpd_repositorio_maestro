-- ============================================================================
-- 02_samc_migracion.sql
-- Migración de datos del dump legacy al nuevo schema SAMC
--
-- ATENCIÓN: Las tablas con datos pequeños (< 1200 filas) usan VALUES directos.
-- Las urbanizaciones (30K filas) se cargan por separado desde bash.
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- TABLAS TEMPORALES DE MAPEO
-- ============================================================================

CREATE TEMP TABLE _map_region   (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_estado   (old_id INT PRIMARY KEY, ccs_id INT, new_id UUID);
CREATE TEMP TABLE _map_municipio(old_id INT PRIMARY KEY, ccs_id INT, new_id UUID);
CREATE TEMP TABLE _map_parroquia(old_id INT PRIMARY KEY, ccs_id INT, new_id UUID);
CREATE TEMP TABLE _map_ente     (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_proceso  (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_ambito   (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_nivel    (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_ae_modo  (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_cargo    (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_rol      (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_partida  (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_trimestre(old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_mes      (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_gerencia (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_poa      (old_id INT PRIMARY KEY, new_id UUID);
CREATE TEMP TABLE _map_accion   (old_id INT PRIMARY KEY, new_id UUID);

-- ============================================================================
-- 1. CARACTERIZACIÓN GEOGRÁFICA
-- ============================================================================

-- 1a. carac_region (10 filas)
WITH data(old_id, nombre, ambito) AS (
    VALUES
        (1,  'AMBITO GENERAL', 'GENERAL'),
        (10, 'AMBITO NACIONAL', 'NACIONAL'),
        (2,  'ANDES', 'ESTATAL'),
        (3,  'CENTRAL', 'ESTATAL'),
        (4,  'GUAYANA', 'ESTATAL'),
        (5,  'LOS LLANOS', 'ESTATAL'),
        (6,  'OCCIDENTAL', 'ESTATAL'),
        (7,  'ORIENTAL', 'ESTATAL'),
        (8,  'INSULAR', 'ESTATAL'),
        (9,  'VERIFICAR', 'ESTATAL')
),
ins AS (
    INSERT INTO samc.carac_region (nombre, ambito)
    SELECT nombre, ambito FROM data
    RETURNING id, nombre
)
INSERT INTO _map_region (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 1b. carac_estado (27 filas)
WITH data(old_id, nombre, abreviatura, region_old_id, estado_ccs_id) AS (
    VALUES
        (35, 'NO APLICA - GG', 'GE', 1, 8086),
        (36, 'NO APLICA - GN', 'NA', 10, 7076),
        (26, 'VERIFICAR',       'VE', 9, 9999),
        (7,  'AMAZONAS',        'AM', 4, 1958),
        (8,  'ANZOATEGUI',      'AN', 7, 1989),
        (9,  'APURE',           'AP', 5, 2069),
        (3,  'ARAGUA',          'AR', 3, 598),
        (10, 'BARINAS',         'BA', 5, 2135),
        (11, 'BOLIVAR',         'BO', 4, 2202),
        (12, 'CARABOBO',        'CA', 3, 2261),
        (13, 'COJEDES',         'CO', 5, 2314),
        (14, 'DELTA AMACURO',   'DA', 4, 2339),
        (2,  'DTTO. CAPITAL',   'DC', 3, 1),
        (15, 'FALCON',          'FA', 6, 2365),
        (16, 'GUARICO',         'GU', 5, 2474),
        (6,  'LA GUAIRA',       'LG', 3, 1702),
        (17, 'LARA',            'LA', 6, 2529),
        (19, 'MERIDA',          'ME', 2, 2655),
        (4,  'MIRANDA',         'MI', 3, 663),
        (18, 'MONAGAS',         'MO', 7, 2597),
        (20, 'NUEVA ESPARTA',   'NE', 7, 2765),
        (21, 'PORTUGUESA',      'PO', 5, 2799),
        (22, 'SUCRE',           'SU', 7, 2855),
        (24, 'TACHIRA',         'TA', 2, 3042),
        (23, 'TRUJILLO',        'TR', 2, 2928),
        (5,  'YARACUY',         'YA', 6, 1361),
        (25, 'ZULIA',           'ZU', 6, 3147)
),
ins AS (
    INSERT INTO samc.carac_estado (nombre, abreviatura, region_id)
    SELECT d.nombre, d.abreviatura, rm.new_id
    FROM data d
    JOIN _map_region rm ON rm.old_id = d.region_old_id
    RETURNING id, nombre
)
INSERT INTO _map_estado (old_id, ccs_id, new_id)
SELECT d.old_id, d.estado_ccs_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 1c. carac_municipio (334 filas)
WITH data(id_municipio, municipio, estado_ccs_id, municipio_ccs_id) AS (
    VALUES
        (3,  'MUNICIPIO LIBERTADOR',      1, 2),
        (4,  'MUNICIPIO BOLIVAR',         598, 599),
        (5,  'MUNICIPIO CAMATAGUA',       598, 600),
        (7,  'MUNICIPIO GIRARDOT',        598, 602),
        (8,  'MUNICIPIO JOSE ANGEL LAMAS',598, 604),
        (9,  'MUNICIPIO JOSE FELIX RIBAS',598, 605),
        (10, 'MUNICIPIO JOSE RAFAEL REVENGA', 598, 606),
        (11, 'MUNICIPIO LIBERTADOR',      598, 607),
        (12, 'MUNICIPIO MARIO BRICEÑO IRAGORRY', 598, 608),
        (13, 'MUNICIPIO OCUMARE DE LA COSTA DE ORO', 598, 609),
        (14, 'MUNICIPIO SAN CASIMIRO',    598, 610),
        (15, 'MUNICIPIO SAN SEBASTIAN',   598, 611),
        (16, 'MUNICIPIO SANTIAGO MARIÑO', 598, 612),
        (17, 'MUNICIPIO SANTOS MICHELENA',598, 613),
        (18, 'MUNICIPIO SUCRE',           598, 614),
        (19, 'MUNICIPIO TOMAS LANDER',    598, 615),
        (20, 'MUNICIPIO URDANETA',        663, 616),
        (21, 'MUNICIPIO ZAMORA',          598, 617),
        (22, 'MUNICIPIO ACEVEDO',         663, 618),
        (23, 'MUNICIPIO BRION',           663, 619),
        (24, 'MUNICIPIO BUROZ',           663, 620),
        (25, 'MUNICIPIO CAUCAGUA',        663, 621),
        (26, 'MUNICIPIO CHAMO',           663, 622),
        (27, 'MUNICIPIO CRISTOBAL ROJAS', 663, 623),
        (28, 'MUNICIPIO EL HATILLO',      663, 624),
        (29, 'MUNICIPIO GUAICAPURO',      663, 625),
        (30, 'MUNICIPIO INDEPENDENCIA',   663, 626),
        (31, 'MUNICIPIO LANDER',          663, 627),
        (32, 'MUNICIPIO LOS SALIAS',      663, 628),
        (33, 'MUNICIPIO PAEZ',            663, 629),
        (34, 'MUNICIPIO PAZ CASTILLO',    663, 630),
        (35, 'MUNICIPIO PEDRO GUAL',      663, 631),
        (36, 'MUNICIPIO PLAZA',           663, 632),
        (37, 'MUNICIPIO RIBAS',           663, 633),
        (38, 'MUNICIPIO RIO CHICO',       663, 634),
        (39, 'MUNICIPIO SIMON BOLIVAR',   663, 635),
        (40, 'MUNICIPIO SUCRE',           663, 636),
        (41, 'MUNICIPIO URDANETA',        663, 637),
        (42, 'MUNICIPIO ZAMORA',          663, 638),
        (43, 'VERIFICAR',                 9999, 9999),
        (44, 'MUNICIPIO LIBERTADOR',      1702, 639),
        (45, 'MUNICIPIO VARGAS',          1702, 640),
        (46, 'MUNICIPIO BOLIVORIANO G/D JOSE ANTONIO ANZOATEGUI', 1361, 641),
        (47, 'MUNICIPIO BRUZUAL',         1361, 642),
        (48, 'MUNICIPIO COCOROTE',        1361, 643),
        (49, 'MUNICIPIO INDEPENDENCIA',   1361, 644),
        (50, 'MUNICIPIO JOSE ANTONIO PAEZ', 1361, 645),
        (51, 'MUNICIPIO LA TRINIDAD',     1361, 646),
        (52, 'MUNICIPIO MANUEL MONGE',    1361, 647),
        (53, 'MUNICIPIO PEÑA',            1361, 648),
        (54, 'MUNICIPIO SAN FELIPE',      1361, 649),
        (55, 'MUNICIPIO SUCRE',           1361, 650),
        (56, 'MUNICIPIO URACHICHE',       1361, 651),
        (57, 'MUNICIPIO VERARAGUA DE VEROES', 1361, 652),
        (58, 'MUNICIPIO BOLIVAR',         2365, 653),
        (59, 'MUNICIPIO BUCHIVACOA',      2365, 654),
        (60, 'MUNICIPIO CACA',            2365, 655),
        (61, 'MUNICIPIO CARIRUBANA',      2365, 656),
        (62, 'MUNICIPIO COLINA',          2365, 657),
        (63, 'MUNICIPIO DABAJURO',        2365, 658),
        (64, 'MUNICIPIO DEMOCRACIA',      2365, 659),
        (65, 'MUNICIPIO FALCON',          2365, 660),
        (66, 'MUNICIPIO FEDERACION',      2365, 661),
        (67, 'MUNICIPIO JACURA',          2365, 662),
        (68, 'MUNICIPIO LOS TAQUES',      2365, 663),
        (69, 'MUNICIPIO MAUROA',          2365, 664),
        (70, 'MUNICIPIO MIRANDA',         2365, 665),
        (71, 'MUNICIPIO MONSEÑOR ITURRIZA', 2365, 666),
        (72, 'MUNICIPIO PALMASOLA',       2365, 667),
        (73, 'MUNICIPIO PETIT',           2365, 668),
        (74, 'MUNICIPIO PIRITU',          2365, 669),
        (75, 'MUNICIPIO SAN FRANCISCO',   2365, 670),
        (76, 'MUNICIPIO SILVA',           2365, 671),
        (77, 'MUNICIPIO SUCRE',           2365, 672),
        (78, 'MUNICIPIO TOCOPERO',        2365, 673),
        (79, 'MUNICIPIO UNION',           2365, 674),
        (80, 'MUNICIPIO URAMO',           2365, 675),
        (81, 'MUNICIPIO ZAMORA',          2365, 676),
        (82, 'MUNICIPIO AGUA BLANCA',     2529, 677),
        (83, 'MUNICIPIO ARAURE',          2529, 678),
        (84, 'MUNICIPIO ANDRES ELOY BLANCO', 2529, 679),
        (85, 'MUNICIPIO CRESPO',          2529, 680),
        (86, 'MUNICIPIO DONA ANA JIMENEZ', 2529, 681),
        (87, 'MUNICIPIO ESTELLER',        2529, 682),
        (88, 'MUNICIPIO GUARAQUE',        2529, 683),
        (89, 'MUNICIPIO IRIBARREN',       2529, 684),
        (90, 'MUNICIPIO JIMENEZ',         2529, 685),
        (91, 'MUNICIPIO MORAN',           2529, 686),
        (92, 'MUNICIPIO PALAVECINO',      2529, 687),
        (93, 'MUNICIPIO SIMON PLANAS',    2529, 688),
        (94, 'MUNICIPIO TORRES',          2529, 689),
        (95, 'MUNICIPIO URDANETA',        2529, 690),
        (96, 'MUNICIPIO ANDRES BELLO',    2655, 691),
        (97, 'MUNICIPIO ANTONIO PINTO SALINAS', 2655, 692),
        (98, 'MUNICIPIO ARIAS',           2655, 693),
        (99, 'MUNICIPIO ARZOBISPO CHACON', 2655, 694),
        (100,'MUNICIPIO CAMPO ELIAS',     2655, 695),
        (101,'MUNICIPIO CARRACIOLO PARRA OLMEDO', 2655, 696),
        (102,'MUNICIPIO CARDENAL QUINTERO', 2655, 697),
        (103,'MUNICIPIO GUARAQUE',        2655, 698),
        (104,'MUNICIPIO JULIO CESAR SALAS', 2655, 699),
        (105,'MUNICIPIO JUSTO BRICENO',   2655, 700),
        (106,'MUNICIPIO LIBERTADOR',      2655, 701),
        (107,'MUNICIPIO MIRANDA',         2655, 702),
        (108,'MUNICIPIO OBISPO RAMOS DE LORA', 2655, 703),
        (109,'MUNICIPIO PADRE NOGUERA',   2655, 704),
        (110,'MUNICIPIO PUEBLO LLANO',    2655, 705),
        (111,'MUNICIPIO RANGEL',          2655, 706),
        (112,'MUNICIPIO RIVAS DAVILA',    2655, 707),
        (113,'MUNICIPIO SANTOS MARQUINA', 2655, 708),
        (114,'MUNICIPIO SUCRE',           2655, 709),
        (115,'MUNICIPIO TOVAR',           2655, 710),
        (116,'MUNICIPIO TULIO FEBRES CORDERO', 2655, 711),
        (117,'MUNICIPIO ZEA',             2655, 712),
        (118,'MUNICIPIO ANACO',           1989, 713),
        (119,'MUNICIPIO ARAGUA',          1989, 714),
        (120,'MUNICIPIO BOLIVAR',         1989, 715),
        (121,'MUNICIPIO BRUZUAL',         1989, 716),
        (122,'MUNICIPIO CAJIGAL',         1989, 717),
        (123,'MUNICIPIO CARVAJAL',        1989, 718),
        (124,'MUNICIPIO FREITES',         1989, 719),
        (125,'MUNICIPIO GUANIPA',         1989, 720),
        (126,'MUNICIPIO GUANTA',          1989, 721),
        (127,'MUNICIPIO INDEPENDENCIA',   1989, 722),
        (128,'MUNICIPIO JOSE GREGORIO MONAGAS', 1989, 723),
        (129,'MUNICIPIO JUAN ANTONIO SOTILLO', 1989, 724),
        (130,'MUNICIPIO LIBERTAD',        1989, 725),
        (131,'MUNICIPIO MANUEL EZEQUIEL BRUZUAL', 1989, 726),
        (132,'MUNICIPIO MIRANDA',         1989, 727),
        (133,'MUNICIPIO MONAGAS',         1989, 728),
        (134,'MUNICIPIO PEDRO MARIA FREITES', 1989, 729),
        (135,'MUNICIPIO PIRITU',          1989, 730),
        (136,'MUNICIPIO SAN JOSE DE GUANIPA', 1989, 731),
        (137,'MUNICIPIO SAN JUAN DE CAPISTRANO', 1989, 732),
        (138,'MUNICIPIO SANTA ANA',       1989, 733),
        (139,'MUNICIPIO SIMON BOLIVAR',   1989, 734),
        (140,'MUNICIPIO SIMON RODRIGUEZ', 1989, 735),
        (141,'MUNICIPIO SOTILLO',         1989, 736),
        (142,'MUNICIPIO URDANETA',        2597, 737),
        (143,'MUNICIPIO ACSTA',           2597, 738),
        (144,'MUNICIPIO AGUASAY',         2597, 739),
        (145,'MUNICIPIO BARBAGOA',        2597, 740),
        (146,'MUNICIPIO BOLIVAR',         2597, 741),
        (147,'MUNICIPIO CARIPE',          2597, 742),
        (148,'MUNICIPIO CEDENO',          2597, 743),
        (149,'MUNICIPIO EZEQUIEL ZAMORA', 2597, 744),
        (150,'MUNICIPIO LIBERTADOR',      2597, 745),
        (151,'MUNICIPIO MATURIN',         2597, 746),
        (152,'MUNICIPIO PIAR',            2597, 747),
        (153,'MUNICIPIO PUNCERES',        2597, 748),
        (154,'MUNICIPIO SOTILLO',         2597, 749),
        (155,'MUNICIPIO TABASCO',         2597, 750),
        (156,'MUNICIPIO URACOA',          2597, 751),
        (157,'MUNICIPIO ANTONIO DEL MONTE', 3147, 752),
        (158,'MUNICIPIO ALMIRANTE PADILLA', 3147, 753),
        (159,'MUNICIPIO BARALT',          3147, 754),
        (160,'MUNICIPIO CABIMAS',         3147, 755),
        (161,'MUNICIPIO CATATUMBO',       3147, 756),
        (162,'MUNICIPIO COLON',           3147, 757),
        (163,'MUNICIPIO FRANCISCO EUGENIO BUSTAMANTE', 3147, 758),
        (164,'MUNICIPIO GUAJIRA',         3147, 759),
        (165,'MUNICIPIO JESUS ENRIQUE LOSSADA', 3147, 760),
        (166,'MUNICIPIO JESUS MARIA SEMPRUN', 3147, 761),
        (167,'MUNICIPIO LA CANADA DE URDANETA', 3147, 762),
        (168,'MUNICIPIO LAGUNILLAS',      3147, 763),
        (169,'MUNICIPIO MACHIQUES DE PERIJA', 3147, 764),
        (170,'MUNICIPIO MARACAIBO',       3147, 765),
        (171,'MUNICIPIO MARTE',           3147, 766),
        (172,'MUNICIPIO MIRANDA',         3147, 767),
        (173,'MUNICIPIO PADRE FRANCISCO JAVIER GARCIA', 3147, 768),
        (174,'MUNICIPIO ROSARIO DE PERIJA', 3147, 769),
        (175,'MUNICIPIO SAN FRANCISCO',   3147, 770),
        (176,'MUNICIPIO SAN RAFAEL',      3147, 771),
        (177,'MUNICIPIO SANTA RITA',      3147, 772),
        (178,'MUNICIPIO SIMON BOLIVAR',   3147, 773),
        (179,'MUNICIPIO SUCRE',           3147, 774),
        (180,'MUNICIPIO SUR DEL LAGO',    3147, 775),
        (181,'MUNICIPIO VALMORE RODRIGUEZ', 3147, 776),
        (182,'MUNICIPIO LIBERTADOR',      2261, 777),
        (183,'MUNICIPIO ARISTIDES BASTIDAS', 2261, 778),
        (184,'MUNICIPIO BEJUMA',          2261, 779),
        (186,'MUNICIPIO CARLOS ARVELO',   2261, 781),
        (187,'MUNICIPIO DIEGO IBARRA',    2261, 782),
        (188,'MUNICIPIO GUACARA',         2261, 783),
        (189,'MUNICIPIO JUAN JOSE MORA',  2261, 784),
        (190,'MUNICIPIO LIBERTADOR',      2261, 785),
        (191,'MUNICIPIO LOS GUAYOS',      2261, 786),
        (192,'MUNICIPIO MIRANDA',         2261, 787),
        (193,'MUNICIPIO MONTALBAN',       2261, 788),
        (194,'MUNICIPIO NAGUANAGUA',      2261, 789),
        (195,'MUNICIPIO PUERTO CABELLO',  2261, 790),
        (196,'MUNICIPIO SAN DIEGO',       2261, 791),
        (197,'MUNICIPIO SAN JOAQUIN',     2261, 792),
        (198,'MUNICIPIO VALENCIA',        2261, 793),
        (199,'MUNICIPIO LIBERTADOR',      2202, 794),
        (200,'MUNICIPIO CARONI',          2202, 795),
        (201,'MUNICIPIO CESAR ANDRADE',   2202, 796),
        (202,'MUNICIPIO EL CALLAO',       2202, 797),
        (203,'MUNICIPIO GRAN SABANA',     2202, 798),
        (204,'MUNICIPIO HERES',           2202, 799),
        (205,'MUNICIPIO PIAR',            2202, 800),
        (206,'MUNICIPIO RAUL LEONI',      2202, 801),
        (207,'MUNICIPIO ROSCIO',          2202, 802),
        (208,'MUNICIPIO SIFONTES',        2202, 803),
        (209,'MUNICIPIO SUCRE',           2202, 804),
        (210,'MUNICIPIO ANDRES ELOY BLANCO', 2202, 805),
        (211,'MUNICIPIO LIBERTAD',        2135, 806),
        (212,'MUNICIPIO ANTONIO JOSE DE SUCRE', 2135, 807),
        (213,'MUNICIPIO ARISMENDI',       2135, 808),
        (214,'MUNICIPIO BARINAS',         2135, 809),
        (215,'MUNICIPIO BOLIVAR',         2135, 810),
        (216,'MUNICIPIO CRUZ PAREDES',    2135, 811),
        (217,'MUNICIPIO EZEQUIEL ZAMORA', 2135, 812),
        (218,'MUNICIPIO OBISPOS',         2135, 813),
        (219,'MUNICIPIO PEDRAZA',         2135, 814),
        (220,'MUNICIPIO ROJAS',           2135, 815),
        (221,'MUNICIPIO SOSA',            2135, 816),
        (222,'MUNICIPIO ANDRES ELOY BLANCO', 2314, 817),
        (223,'MUNICIPIO ANZOATEGUI',      2314, 818),
        (224,'MUNICIPIO ARISMENDI',       2314, 819),
        (225,'MUNICIPIO CAMAGUAN',        2314, 820),
        (226,'MUNICIPIO CHAGUARAMAS',     2314, 821),
        (227,'MUNICIPIO CHIRGUA',         2314, 822),
        (228,'MUNICIPIO ESTELLER',        2314, 823),
        (229,'MUNICIPIO FALCON',          2314, 824),
        (230,'MUNICIPIO GUAYABAL',        2314, 825),
        (231,'MUNICIPIO JOSE FELIX RIBAS', 2314, 826),
        (232,'MUNICIPIO MARTIN PEREZ DE ALDAYA', 2314, 827),
        (233,'MUNICIPIO MONAGAS',         2314, 828),
        (234,'MUNICIPIO ORTUÑO',          2314, 829),
        (235,'MUNICIPIO PAO DE SAN JUAN BAUTISTA', 2314, 830),
        (236,'MUNICIPIO RICAURTE',        2314, 831),
        (237,'MUNICIPIO SAN NICOLAS DE LA PALMA', 2314, 832),
        (238,'MUNICIPIO TINACUILLA',      2314, 833),
        (239,'MUNICIPIO ZARAZA',          2314, 834),
        (240,'MUNICIPIO AUTONOMO ALTO ORINOCO', 1958, 835),
        (241,'MUNICIPIO ATABAPO',         1958, 836),
        (242,'MUNICIPIO ATURES',          1958, 837),
        (243,'MUNICIPIO AUTONOMO A UTANA', 1958, 838),
        (244,'MUNICIPIO AUTONOMO MAROA',  1958, 839),
        (245,'MUNICIPIO AUTONOMO MANAPIARE', 1958, 840),
        (246,'MUNICIPIO AUTONOMO GUAYANA', 1958, 841),
        (247,'MUNICIPIO AUTONOMO RIO NEGRO', 1958, 842),
        (248,'MUNICIPIO TUCUPITA',        2339, 843),
        (249,'MUNICIPIO ANTONIO DIAZ',    2339, 844),
        (250,'MUNICIPIO CASACOIMA',       2339, 845),
        (251,'MUNICIPIO PEDERNALES',      2339, 846),
        (252,'MUNICIPIO LIBERTADOR',      2474, 847),
        (253,'MUNICIPIO CAMAGUAN',        2474, 848),
        (254,'MUNICIPIO CHAGUARAMAS',     2474, 849),
        (255,'MUNICIPIO EL SOCORRO',      2474, 850),
        (256,'MUNICIPIO JOSE FELIX RIBAS', 2474, 851),
        (257,'MUNICIPIO LEZAMA',          2474, 852),
        (258,'MUNICIPIO MONAGAS',         2474, 853),
        (259,'MUNICIPIO MELLADO',         2474, 854),
        (260,'MUNICIPIO ORTIZ',           2474, 855),
        (261,'MUNICIPIO ROSCIO',          2474, 856),
        (262,'MUNICIPIO SAN GERONIMO DE GUAYABAL', 2474, 857),
        (263,'MUNICIPIO SAN JOSE DE GUARIBE', 2474, 858),
        (264,'MUNICIPIO SANTA MARIA DE IPIRE', 2474, 859),
        (265,'MUNICIPIO JOSE TADEO MONAGAS', 2474, 860),
        (266,'MUNICIPIO JUAN GERMAN ROSCIO', 2474, 861),
        (267,'MUNICIPIO JUAN MANUEL CAJIGAL', 2474, 862),
        (268,'MUNICIPIO LAS MERCEDES',    2474, 863),
        (269,'MUNICIPIO AUTONOMO ARISTIDES BASTIDAS', 2069, 864),
        (270,'MUNICIPIO ACHAGUAS',        2069, 865),
        (271,'MUNICIPIO AUTONOMO BIRUACA', 2069, 866),
        (272,'MUNICIPIO AUTONOMO MUÑOZ',  2069, 867),
        (273,'MUNICIPIO AUTONOMO PAEZ',   2069, 868),
        (274,'MUNICIPIO PEDRO CAMEJO',    2069, 869),
        (275,'MUNICIPIO ROMULO GALLEGOS', 2069, 870),
        (276,'MUNICIPIO AUTONOMO SAN FERNANDO', 2069, 871),
        (278,'MUNICIPIO LIBERTADOR',      2765, 873),
        (279,'MUNICIPIO ARISMENDI',       2765, 874),
        (280,'MUNICIPIO DIAZ',            2765, 875),
        (281,'MUNICIPIO GARCIA',          2765, 876),
        (282,'MUNICIPIO GOMEZ',           2765, 877),
        (283,'MUNICIPIO MARIÑO',          2765, 878),
        (284,'MUNICIPIO PENINSULA DE MACANAO', 2765, 879),
        (285,'MUNICIPIO TUBORES',         2765, 880),
        (286,'MUNICIPIO VILLALBA',        2765, 881),
        (287,'MUNICIPIO LIBERTADOR',      2799, 882),
        (288,'MUNICIPIO AGUA BLANCA',     2799, 883),
        (289,'MUNICIPIO ARAURE',          2799, 884),
        (290,'MUNICIPIO ESTELLER',        2799, 885),
        (291,'MUNICIPIO GUANARE',         2799, 886),
        (292,'MUNICIPIO GUANARITO',       2799, 887),
        (293,'MUNICIPIO MONSEÑOR JOSE VICENTE DE UNDA', 2799, 888),
        (294,'MUNICIPIO OSPINO',          2799, 889),
        (295,'MUNICIPIO PAEZ',            2799, 890),
        (296,'MUNICIPIO PAPELON',         2799, 891),
        (297,'MUNICIPIO SAN GENARO DE BOCONOITO', 2799, 892),
        (298,'MUNICIPIO SAN RAFAEL DE ONOTO', 2799, 893),
        (299,'MUNICIPIO SANTA ROSALIA',   2799, 894),
        (300,'MUNICIPIO SUCRE',           2799, 895),
        (301,'MUNICIPIO TUREN',           2799, 896),
        (302,'MUNICIPIO ANDRES ELOY BLANCO', 2855, 897),
        (303,'MUNICIPIO ANDRES MATA',     2855, 898),
        (304,'MUNICIPIO ARISMENDI',       2855, 899),
        (305,'MUNICIPIO BENITEZ',         2855, 900),
        (306,'MUNICIPIO BERMUDEZ',        2855, 901),
        (307,'MUNICIPIO BOLIVAR',         2855, 902),
        (308,'MUNICIPIO CAJIGAL',         2855, 903),
        (309,'MUNICIPIO CRUZ SALMERON ACOSTA', 2855, 904),
        (310,'MUNICIPIO LIBERTAD',        2855, 905),
        (311,'MUNICIPIO LIBERTADOR',      2855, 906),
        (312,'MUNICIPIO MARIN',           2855, 907),
        (313,'MUNICIPIO MEJIA',           2855, 908),
        (314,'MUNICIPIO MONTES',          2855, 909),
        (315,'MUNICIPIO RIBER PIAR',      2855, 910),
        (316,'MUNICIPIO SUCRE',           2855, 911),
        (317,'MUNICIPIO VALDEZ',          2855, 912),
        (318,'MUNICIPIO ANDRES BELLO',    3042, 913),
        (319,'MUNICIPIO ANTONIO ROMULO COSTA', 3042, 914),
        (320,'MUNICIPIO AYACUCHO',        3042, 915),
        (321,'MUNICIPIO BOLIVAR',         3042, 916),
        (322,'MUNICIPIO CARDENAS',        3042, 917),
        (323,'MUNICIPIO CORDOBA',         3042, 918),
        (324,'MUNICIPIO FERNANDEZ FEO',   3042, 919),
        (325,'MUNICIPIO FRANCISCO DE MIRANDA', 3042, 920),
        (326,'MUNICIPIO GARCIA DE HEVIA', 3042, 921),
        (327,'MUNICIPIO GUASIMOS',        3042, 922),
        (328,'MUNICIPIO INDEPENDENCIA',   3042, 923),
        (329,'MUNICIPIO JAUREGUI',        3042, 924),
        (330,'MUNICIPIO JOSE MARIA VARGAS', 3042, 925),
        (331,'MUNICIPIO JUNIN',           3042, 926),
        (332,'MUNICIPIO LIBERTAD',        3042, 927),
        (333,'MUNICIPIO LIBERTADOR',      3042, 928),
        (334,'MUNICIPIO LOBATERA',        3042, 929),
        (335,'MUNICIPIO MARISCAL SUCRE',  3042, 930),
        (336,'MUNICIPIO MICHELENA',       3042, 931),
        (337,'MUNICIPIO PADRE PEDRO CHIEN', 3042, 932),
        (338,'MUNICIPIO PANAMERICANO',    3042, 933),
        (339,'MUNICIPIO PEDRO MARIA UREÑA', 3042, 934),
        (340,'MUNICIPIO RAFAEL URDANETA', 3042, 935),
        (341,'MUNICIPIO SAMUEL DARIO MALDONADO', 3042, 936),
        (342,'MUNICIPIO SAN CRISTOBAL',   3042, 937),
        (343,'MUNICIPIO SAN JUDAS TADEO', 3042, 938),
        (344,'MUNICIPIO SEBORUCO',        3042, 939),
        (345,'MUNICIPIO SIMON RODRIGUEZ', 3042, 940),
        (346,'MUNICIPIO SUCRE',           3042, 941),
        (347,'MUNICIPIO TORBES',          3042, 942),
        (348,'MUNICIPIO URIBANTE',        3042, 943),
        (349,'MUNICIPIO DEMOCRACIA',      2069, 944),
        (350,'MUNICIPIO FRANCISCO DE MIRANDA', 2314, 945),
        (351,'MUNICIPIO LIBERTAD',        2339, 946),
        (352,'MUNICIPIO BOLIVAR',         2928, 947),
        (353,'MUNICIPIO ANDRES BELLO',    2928, 948),
        (354,'MUNICIPIO BOCONO',          2928, 949),
        (355,'MUNICIPIO CANDELARIA',      2928, 950),
        (356,'MUNICIPIO CARACHE',         2928, 951),
        (357,'MUNICIPIO ESCUQUE',         2928, 952),
        (358,'MUNICIPIO JOSE FELIPE MARQUEZ CAÑIZALES', 2928, 953),
        (359,'MUNICIPIO JUAN VICENTE CAMPO ELIAS', 2928, 954),
        (360,'MUNICIPIO LA CEIBA',        2928, 955),
        (361,'MUNICIPIO MIRANDA',         2928, 956),
        (362,'MUNICIPIO MONTE CARMELO',   2928, 957),
        (363,'MUNICIPIO MOTATAN',         2928, 958),
        (364,'MUNICIPIO PAMPAN',          2928, 959),
        (365,'MUNICIPIO PAMPANITO',       2928, 960),
        (366,'MUNICIPIO RANGEL',          2928, 961),
        (367,'MUNICIPIO SAN RAFAEL DE CARVAJAL', 2928, 962),
        (368,'MUNICIPIO SUCRE',           2928, 963),
        (369,'MUNICIPIO TRUJILLO',        2928, 964),
        (370,'MUNICIPIO URDANETA',        2928, 965),
        (371,'MUNICIPIO VALERA',          2928, 966),
        (372,'MUNICIPIO LIBERTADOR',      1, 967),
        (373,'MUNICIPIO CHACON',          1, 968),
        (374,'MUNICIPIO DTO CO AYACUCHO', 1702, 969),
        (375,'MUNICIPIO PADRE JOSE DE LA VEGA', 1, 970),
        (376,'MUNICIPIO CATEDRAL',         1, 971),
        (377,'MUNICIPIO FORTIN',          2069, 972),
        (378,'MUNICIPIO GUAYANA',         1958, 973),
        (379,'MUNICIPIO INDEPENDENCIA',   2069, 974),
        (380,'MUNICIPIO LIBERTAD',        2069, 975),
        (381,'MUNICIPIO MIRANDA',         2069, 976),
        (382,'MUNICIPIO SAN JUAN DE LOS MORROS', 2474, 977),
        (383,'MUNICIPIO SAN JERONIMO',    2855, 978),
        (384,'MUNICIPIO SANTA BARBARA',   2597, 979),
        (385,'MUNICIPIO LA SANTISIMA TRINIDAD', 2202, 980),
        (386,'MUNICIPIO FELIX MUNOZ',     2202, 981),
        (387,'MUNICIPIO DELTA NORTE',     2202, 982),
        (388,'MUNICIPIO EL CALLAO',       2202, 797)
),
ins AS (
    INSERT INTO samc.carac_municipio (nombre, estado_id)
    SELECT d.municipio, e.new_id
    FROM data d
    JOIN _map_estado e ON e.ccs_id = d.estado_ccs_id
    ON CONFLICT (nombre, estado_id) DO NOTHING
    RETURNING id, nombre, estado_id
)
INSERT INTO _map_municipio (old_id, ccs_id, new_id)
SELECT d.id_municipio, d.municipio_ccs_id, i.id
FROM data d
JOIN _map_estado e ON e.ccs_id = d.estado_ccs_id
JOIN ins i ON i.nombre = d.municipio AND i.estado_id = e.new_id;

-- 1d. carac_parroquia (1,102 filas)
-- Se cargan desde un archivo externo generado por bash para mantener este script limpio
-- Ejecutar: 03_cargar_parroquias.sh

-- ============================================================================
-- 2. DOMINIO DE NEGOCIO
-- ============================================================================

-- 2a. samc_ente (1 fila)
WITH ins AS (
    INSERT INTO samc.samc_ente (nombre)
    VALUES ('CORPOELEC')
    RETURNING id
)
INSERT INTO _map_ente (old_id, new_id)
SELECT 1, id FROM ins;

-- 2b. samc_proceso (4 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'GENERACIÓN'), (2, 'TRANSMISIÓN'), (3, 'DISTRIBUCIÓN'), (4, 'COMERCIALIZACIÓN')
),
ins AS (
    INSERT INTO samc.samc_proceso (ente_id, nombre)
    SELECT e.new_id, d.nombre
    FROM data d
    CROSS JOIN _map_ente e
    RETURNING id, nombre
)
INSERT INTO _map_proceso (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2c. samc_gerencia_ambito (3 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'GENERAL'), (2, 'NACIONAL'), (3, 'ESTATAL')
),
ins AS (
    INSERT INTO samc.samc_gerencia_ambito (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_ambito (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2d. samc_gerencia_nivel (3 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'APOYO'), (2, 'SUSTANTIVO'), (3, 'GENERAL')
),
ins AS (
    INSERT INTO samc.samc_gerencia_nivel (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_nivel (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2e. samc_ae_modo (3 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'INCREMENTO'), (2, 'DISMINUCIÓN'), (3, 'CUMPLIMIENTO')
),
ins AS (
    INSERT INTO samc.samc_ae_modo (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_ae_modo (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2f. samc_cargo (4 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'GERENTE GENERAL'), (2, 'GERENTE NACIONAL'), (3, 'COORDINADOR NACIONAL'), (4, 'ASESOR MAYOR')
),
ins AS (
    INSERT INTO samc.samc_cargo (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_cargo (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2g. samc_rol (3 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'GERENTE GENERAL'), (2, 'GERENTE NACIONAL'), (3, 'COORDINADOR NACIONAL')
),
ins AS (
    INSERT INTO samc.samc_rol (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_rol (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2h. samc_partida (5 filas)
WITH data(old_id, codigo, nombre) AS (
    VALUES (1, '402', 'Materiales, Suministros y Mercancias'),
           (2, '403', 'Servicios No Personales'),
           (3, '404', 'Activos Reales'),
           (4, '405', 'Activos Financieros'),
           (5, '408', 'Otros Gastos')
),
ins AS (
    INSERT INTO samc.samc_partida (codigo, nombre)
    SELECT codigo, nombre FROM data
    RETURNING id, codigo
)
INSERT INTO _map_partida (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.codigo = d.codigo;

-- 2i. samc_trimestre (4 filas)
WITH data(old_id, nombre) AS (
    VALUES (1, 'PRIMER TRIMESTRE'), (2, 'SEGUNDO TRIMESTRE'), (3, 'TERCER TRIMESTRE'), (4, 'CUARTO TRIMESTRE')
),
ins AS (
    INSERT INTO samc.samc_trimestre (nombre)
    SELECT nombre FROM data
    RETURNING id, nombre
)
INSERT INTO _map_trimestre (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2j. samc_mes (12 filas)
WITH data(old_id, trimestre_old_id, nombre) AS (
    VALUES (1,  1, 'ENERO'),    (2,  1, 'FEBRERO'),  (3,  1, 'MARZO'),
           (4,  2, 'ABRIL'),    (5,  2, 'MAYO'),     (6,  2, 'JUNIO'),
           (7,  3, 'JULIO'),    (8,  3, 'AGOSTO'),   (9,  3, 'SEPTIEMBRE'),
           (10, 4, 'OCTUBRE'),  (11, 4, 'NOVIEMBRE'),(12, 4, 'DICIEMBRE')
),
ins AS (
    INSERT INTO samc.samc_mes (trimestre_id, nombre)
    SELECT tm.new_id, d.nombre
    FROM data d
    JOIN _map_trimestre tm ON tm.old_id = d.trimestre_old_id
    RETURNING id, nombre
)
INSERT INTO _map_mes (old_id, new_id)
SELECT d.old_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2k. samc_gerencia (8 filas)
WITH data(gerencia_id, ambito_old_id, nivel_old_id, nombre, niv_ger, niv_sup, ente_old_id, region_old_id, estado_old_id, proceso_old_id) AS (
    VALUES
        (1, 1, 3, 'GERENCIA GENERAL DE COMERCIALIZACIÓN',           '1', '0', 1, 1,  35, 4),
        (4, 2, 2, 'GERENCIA NACIONAL DE ATENCIÓN AL USUARIO MÁSIVO', '3', '1', 1, 10, 36, 4),
        (5, 2, 2, 'GERENCIA NACIONAL DE ATENCIÓN AL USUARIO CORPORATIVO', '3', '1', 1, 10, 36, 4),
        (7, 2, 2, 'GERENCIA NACIONAL DE RECUPERACIÓN DE LA ENERGÍA', '3', '1', 1, 10, 36, 4),
        (2, 2, 2, 'GERENCIA NACIONAL DE GESTIÓN COMERCIAL',         '3', '1', 1, 10, 36, 4),
        (6, 2, 2, 'COORDINACIÓN NACIONAL DE FACTIBILIDAD DEL SERVICIO ELÉCTRICO', '4', '1', 1, 10, 36, 4),
        (3, 2, 1, 'GERENCIA NACIONAL DE PLANIFICACIÓN COMERCIAL',   '2', '1', 1, 10, 36, 4),
        (8, 2, 2, 'COORDINACIÓN NACIONAL DE MEDIDORES',             '4', '1', 1, 10, 36, 4)
),
ins AS (
    INSERT INTO samc.samc_gerencia (codigo, ambito_id, nivel_id, nombre, nivel_gerencia, nivel_sup, ente_id, region_id, estado_id, proceso_id)
    SELECT
        NULL, a.new_id, n.new_id, d.nombre, d.niv_ger, d.niv_sup,
        e.new_id, r.new_id, es.new_id, p.new_id
    FROM data d
    JOIN _map_ambito a    ON a.old_id    = d.ambito_old_id
    JOIN _map_nivel n     ON n.old_id    = d.nivel_old_id
    JOIN _map_ente e      ON e.old_id    = d.ente_old_id
    JOIN _map_region r    ON r.old_id    = d.region_old_id
    JOIN _map_estado es   ON es.old_id   = d.estado_old_id
    JOIN _map_proceso p   ON p.old_id    = d.proceso_old_id
    RETURNING id, nombre
)
INSERT INTO _map_gerencia (old_id, new_id)
SELECT d.gerencia_id, i.id
FROM data d
JOIN ins i ON i.nombre = d.nombre;

-- 2l. samc_poa (2 filas)
WITH data(poa_id, codigo, denominacion, ente_old_id, objetivo, periodo, fecha_ini, fecha_fin) AS (
    VALUES
        (1, 'POA 2023', 'POA 2023', 1, 'Comercializar la Energía Eléctrica', '2023', '2023-09-04'::DATE, '2023-12-15'::DATE),
        (2, 'POA 2024', 'POA 2024', 1, 'COMERCIALIZAR LA ENERGÍA ELÉCTRICA', '2024', '2024-01-01'::DATE, '2024-12-31'::DATE)
),
ins AS (
    INSERT INTO samc.samc_poa (codigo_sipes, denominacion, ente_id, objetivo_especifico, periodo_ejecucion, fecha_inicio, fecha_termino)
    SELECT d.codigo, d.denominacion, e.new_id, d.objetivo, d.periodo, d.fecha_ini, d.fecha_fin
    FROM data d
    JOIN _map_ente e ON e.old_id = d.ente_old_id
    RETURNING id, denominacion
)
INSERT INTO _map_poa (old_id, new_id)
SELECT d.poa_id, i.id
FROM data d
JOIN ins i ON i.denominacion = d.denominacion;

-- 2m. samc_poa_accion_especifica (17 filas)
WITH data(acc_esp_id, poa_old_id, codigo, numero, descripcion, fecha_ini, fecha_fin, unidad_medida, programado, modo_old_id, observaciones, gerencia_old_id) AS (
    VALUES
        (3,  1, '00003', '00003', 'Realizar las Lecturas de los Suministros',       '2023-01-01'::DATE, '2023-12-31', 'LECTURAS',   46562676, 3, 'Ninguna', NULL::int),
        (6,  1, '00006', '00006', 'Reducir pérdidas no técnicas',                    '2023-01-01', '2023-12-31', 'GWh',         511,      2, 'Ninguna', NULL),
        (7,  1, '00007', '00007', 'Comercializar Energía Eléctrica',                 '2023-01-01', '2023-12-31', 'GWh',         82500,    3, 'Ninguna', NULL),
        (1,  1, '00002', '00002', 'Instalar Equipo de Medición',                     '2023-01-01', '2023-12-31', 'INSTALACIONES',3281325,  3, 'EQUIPOS INSTALADOS', NULL),
        (5,  1, '00005', '00005', 'Recaudar',                                         '2023-01-01', '2023-12-31', 'BSD',         1449005189.84237, 3, 'Ninguna', NULL),
        (4,  1, '00004', '00004', 'Facturar y Notificar',                            '2023-01-01', '2023-12-31', 'BSD',         77937827, 3, 'Ninguna', NULL),
        (8,  1, '00008', '00008', 'Realizar estudios de factibilidad del Servicio Eléctrico', '2023-01-01', '2023-12-31', 'ESTUDIOS', 864, 3, 'Nro. de Estudios', NULL),
        (13, 2, '00005', '00005', 'Facturar la Venta de Energía Eléctrica',          '2024-01-01', '2024-12-31', 'Número Facturas Emitidas', 68156717, 3, 'Ninguna', 2),
        (14, 2, '00006', '00006', 'Notificar al Usuario',                            '2024-01-01', '2024-12-31', 'Número de Notificaciones', 7113871, 3, 'Ninguna', 2),
        (15, 2, '00007', '00007', 'Recaudar',                                         '2024-01-01', '2024-12-31', 'Bs.',         10174626865, 3, 'Ninguna', 2),
        (16, 2, '00008', '00008', 'Reducir Pérdidas no Técnicas',                    '2024-01-01', '2024-12-31', 'GWh',         2957,      2, 'Ninguna', 7),
        (17, 2, '00009', '00009', 'Gestionar los Estudios de Factibilidad del Servicio.', '2024-01-01', '2024-12-31', 'Número de Estudios', 1064, 3, 'Ninguna', 6),
        (2,  1, '00001', '00001', 'Atender al Usuario',                              '2023-01-01', '2023-12-31', 'USUARIOS',    7085257,  3, 'Ninguna', 2),
        (11, 2, '00002', '00002', 'Comercializar la Energía Eléctrica',              '2024-01-01', '2024-12-31', 'GWh',         67234,    3, 'Ninguna', 2),
        (10, 2, '00003', '00003', 'Instalar Equipo de Medición',                     '2024-01-01', '2024-12-31', 'Número de Equipos Instalados', 140000, 3, 'Ninguna', 8),
        (12, 2, '00004', '00004', 'Realizar la Lectura de los Puntos de Suministros','2024-01-01', '2024-12-31', 'Número de Lecturas', 28232993, 3, 'Ninguna', 2),
        (9,  2, '00001', '00001', 'Atender al Usuario',                              '2024-01-01', '2024-12-31', 'Número de Usuarios Atendidos', 12934310, 3, 'Ninguna', 2)
),
ins AS (
    INSERT INTO samc.samc_poa_accion_especifica (poa_id, codigo, numero, descripcion, fecha_inicio, fecha_culminacion, unidad_medida, programado, ejecutado, restante, eficacia, modo_id, observaciones, gerencia_reporta_id)
    SELECT
        po.new_id, d.codigo, d.numero, d.descripcion, d.fecha_ini, d.fecha_fin::DATE,
        d.unidad_medida, d.programado, 0, d.programado, 0,
        m.new_id, d.observaciones,
        CASE WHEN d.gerencia_old_id IS NOT NULL THEN g.new_id ELSE NULL END
    FROM data d
    JOIN _map_poa po       ON po.old_id        = d.poa_old_id
    JOIN _map_ae_modo m    ON m.old_id         = d.modo_old_id
    LEFT JOIN _map_gerencia g ON g.old_id      = d.gerencia_old_id
    RETURNING id, codigo, poa_id
)
INSERT INTO _map_accion (old_id, new_id)
SELECT d.acc_esp_id, i.id
FROM data d
JOIN _map_poa po ON po.old_id = d.poa_old_id
JOIN ins i ON i.codigo = d.codigo AND i.poa_id = po.new_id;

-- ============================================================================
-- 3. METAS FÍSICAS Y FINANCIERAS
-- ============================================================================

-- 3a. samc_meta_fisica (117 filas)
WITH mf_data(mfis_id, acc_esp_old_id, codigo, mes_old_id, trimestre_old_id, programado_str, ejecutado_str, eficacia_str, unidad_medida) AS (
    VALUES
        (1, 5, '00005', 1, 1, '57491868', '0', '0', 'BSD'),
        (2, 5, '00005', 2, 1, '129125116', '0', '0', 'BSD'),
        (3, 5, '00005', 3, 1, '85841750', '0', '0', 'BSD'),
        (4, 5, '00005', 4, 2, '80748029', '0', '0', 'BSD'),
        (5, 5, '00005', 5, 2, '108827729', '0', '0', 'BSD'),
        (6, 5, '00005', 6, 2, '103653182', '0', '0', 'BSD'),
        (7, 5, '00005', 7, 3, '111837401', '0', '0', 'BSD'),
        (8, 5, '00005', 8, 3, '141194595', '0', '0', 'BSD'),
        (9, 5, '00005', 9, 3, '172180592', '0', '0', 'BSD'),
        (60, 13, '00005', 3, 1, '5793022', '0', '0', 'Número Facturas Emitidas'),
        (15, 9, '00001', 5, 2, '1091451', '0', '0.00', 'Usuarios Atendidos'),
        (13, 9, '00001', 4, 2, '1100512', '0', '0.00', 'Usuarios Atendidos'),
        (61, 13, '00005', 4, 2, '5680846', '0', '0', 'Número Facturas Emitidas'),
        (40, 11, '00002', 7, 3, '5644.72', '0', '0', 'GWh'),
        (58, 13, '00005', 2, 1, '5577519', '0', '0', 'Número Facturas Emitidas'),
        (65, 13, '00005', 8, 3, '5672058', '0', '0', 'Número Facturas Emitidas'),
        (66, 13, '00005', 9, 3, '5677744', '0', '0', 'Número Facturas Emitidas'),
        (68, 13, '00005', 11, 4, '5698372', '0', '0', 'Número Facturas Emitidas'),
        (67, 13, '00005', 10, 4, '5686521', '0', '0', 'Número Facturas Emitidas'),
        (45, 11, '00002', 12, 4, '4845.60', '0', '0', 'GWh'),
        (59, 13, '00005', 1, 1, '5643959', '0', '0', 'Número Facturas Emitidas'),
        (77, 14, '00006', 8, 3, '585347', '0', '0', 'Número de Notificaciones'),
        (63, 13, '00005', 6, 2, '5670067', '0', '0', 'Número Facturas Emitidas'),
        (76, 14, '00006', 7, 3, '590331', '0', '0', 'Número de Notificaciones'),
        (35, 11, '00002', 2, 1, '6008.58', '0', '0', 'GWh'),
        (17, 9, '00001', 8, 3, '1064268', '0', '0', 'Usuarios Atendidos'),
        (18, 9, '00001', 9, 3, '1055207', '0', '0', 'Usuarios Atendidos'),
        (20, 9, '00001', 11, 4, '1037085', '0', '0', 'Usuarios Atendidos'),
        (21, 9, '00001', 12, 4, '1028024', '0', '0', 'Usuarios Atendidos'),
        (11, 9, '00001', 2, 1, '1118634', '0', '0.00', 'Usuarios Atendidos'),
        (34, 11, '00002', 1, 1, '6783.89', '0', '0', 'GWh'),
        (23, 10, '00003', 2, 1, '12879', '0', '0', 'Equipos Instalados'),
        (24, 10, '00003', 5, 2, '14413', '0', '0', 'Equipos Instalados'),
        (25, 10, '00003', 4, 2, '11405', '0', '0', 'Equipos Instalados'),
        (26, 10, '00003', 6, 2, '13813', '0', '0', 'Equipos Instalados'),
        (28, 10, '00003', 7, 3, '11716', '0', '0', 'Equipos Instalados'),
        (29, 10, '00003', 8, 3, '8918', '0', '0', 'Equipos Instalados'),
        (31, 10, '00003', 10, 4, '14092', '0', '0', 'Equipos Instalados'),
        (32, 10, '00003', 11, 4, '9224', '0', '0', 'Equipos Instalados'),
        (22, 10, '00003', 1, 1, '7134', '0', '0', 'Equipos Instalados'),
        (49, 12, '00004', 5, 2, '2352749', '0', '0', 'Número de Lecturas'),
        (50, 12, '00004', 4, 2, '2352749', '0', '0', 'Número de Lecturas'),
        (48, 12, '00004', 3, 1, '2352749', '0', '0', 'Número de Lecturas'),
        (46, 12, '00004', 1, 1, '2352749', '0', '0', 'Número de Lecturas'),
        (69, 13, '00005', 12, 4, '5713286', '0', '0', 'Número Facturas Emitidas'),
        (51, 12, '00004', 6, 2, '2352749', '0', '0', 'Número de Lecturas'),
        (52, 12, '00004', 7, 3, '2352749', '0', '0', 'Número de Lecturas'),
        (53, 12, '00004', 8, 3, '2352749', '0', '0', 'Número de Lecturas'),
        (54, 12, '00004', 9, 3, '2352749', '0', '0', 'Número de Lecturas'),
        (55, 12, '00004', 10, 4, '2352749', '0', '0', 'Número de Lecturas'),
        (57, 12, '00004', 12, 4, '2352754', '0', '0', 'Número de Lecturas'),
        (47, 12, '00004', 2, 1, '2352749', '0', '0', 'Número de Lecturas'),
        (75, 14, '00006', 5, 2, '600298', '0', '0', 'Número de Notificaciones'),
        (73, 14, '00006', 4, 2, '605281', '0', '0', 'Número de Notificaciones'),
        (79, 14, '00006', 10, 4, '575380', '0', '0', 'Número de Notificaciones'),
        (70, 14, '00006', 1, 1, '620232', '0', '0', 'Número de Notificaciones'),
        (81, 14, '00006', 12, 4, '565413', '0', '0', 'Número de Notificaciones'),
        (72, 14, '00006', 3, 1, '610265', '0', '0', 'Número de Notificaciones'),
        (71, 14, '00006', 2, 1, '615249', '0', '0', 'Número de Notificaciones'),
        (78, 14, '00006', 9, 3, '580364', '0', '0', 'Número de Notificaciones'),
        (86, 15, '00007', 5, 2, '847885572', '0', '0', 'Bs.'),
        (88, 15, '00007', 7, 3, '847885572', '0', '0', 'Bs.'),
        (90, 15, '00007', 9, 3, '847885572', '0', '0', 'Bs.'),
        (91, 15, '00007', 10, 4, '847885572', '0', '0', 'Bs.'),
        (84, 15, '00007', 3, 1, '847885572', '0', '0', 'Bs.'),
        (87, 15, '00007', 6, 2, '847885572', '0', '0', 'Bs.'),
        (82, 15, '00007', 1, 1, '847885572', '0', '0', 'Bs.'),
        (83, 15, '00007', 2, 1, '847885572', '0', '0', 'Bs.'),
        (85, 15, '00007', 4, 2, '847885572', '0', '0', 'Bs.'),
        (16, 9, '00001', 7, 3, '1073329', '0', '0', 'Usuarios Atendidos'),
        (37, 11, '00002', 6, 2, '5710.20', '0', '0', 'GWh'),
        (38, 11, '00002', 5, 2, '5623.27', '0', '0', 'GWh'),
        (36, 11, '00002', 3, 1, '6179.80', '0', '0', 'GWh'),
        (43, 11, '00002', 10, 4, '4950.01', '0', '0', 'GWh'),
        (42, 11, '00002', 9, 3, '4723.87', '0', '0', 'GWh'),
        (41, 11, '00002', 8, 3, '5487.85', '0', '0', 'GWh'),
        (30, 10, '00003', 9, 3, '12833', '0', '0', 'Equipos Instalados'),
        (44, 11, '00002', 11, 4, '4808.87', '0', '0', 'GWh'),
        (14, 9, '00001', 6, 2, '1082390', '0', '0.00', 'Usuarios Atendidos'),
        (103, 16, '00008', 10, 4, '256', '0', '0', 'GWh'),
        (104, 16, '00008', 11, 4, '240', '0', '0', 'GWh'),
        (115, 17, '00009', 10, 4, '96', '0', '0', 'Número de Estudios'),
        (106, 17, '00009', 1, 1, '69', '0', '0', 'Número de Estudios'),
        (107, 17, '00009', 2, 1, '89', '0', '0', 'Número de Estudios'),
        (108, 17, '00009', 3, 1, '89', '0', '0', 'Número de Estudios'),
        (109, 17, '00009', 4, 2, '90', '0', '0', 'Número de Estudios'),
        (110, 17, '00009', 5, 2, '95', '0', '0', 'Número de Estudios'),
        (111, 17, '00009', 6, 2, '93', '0', '0', 'Número de Estudios'),
        (116, 17, '00009', 11, 4, '90', '0', '0', 'Número de Estudios'),
        (112, 17, '00009', 7, 3, '94', '0', '0', 'Número de Estudios'),
        (113, 17, '00009', 8, 3, '97', '0', '0', 'Número de Estudios'),
        (114, 17, '00009', 9, 3, '98', '0', '0', 'Número de Estudios'),
        (117, 17, '00009', 12, 4, '64', '0', '0', 'Número de Estudios'),
        (19, 9, '00001', 10, 4, '1046146', '0', '0', 'Usuarios Atendidos'),
        (12, 9, '00001', 3, 1, '1109573', '0', '0.00', 'Usuarios Atendidos'),
        (39, 11, '00002', 4, 2, '6466.98', '0', '0', 'GWh'),
        (27, 10, '00003', 3, 1, '15249', '0', '0', 'Equipos Instalados'),
        (33, 10, '00003', 12, 4, '8324', '0', '0', 'Equipos Instalados'),
        (56, 12, '00004', 11, 4, '2352749', '0', '0', 'Número de Lecturas'),
        (64, 13, '00005', 7, 3, '5669488', '0', '0', 'Número Facturas Emitidas'),
        (62, 13, '00005', 5, 2, '5673837', '0', '0', 'Número Facturas Emitidas'),
        (74, 14, '00006', 6, 2, '595314', '0', '0', 'Número de Notificaciones'),
        (80, 14, '00006', 11, 4, '570397', '0', '0', 'Número de Notificaciones'),
        (93, 15, '00007', 12, 4, '847885572', '0', '0', 'Bs.'),
        (89, 15, '00007', 8, 3, '847885572', '0', '0', 'Bs.'),
        (92, 15, '00007', 11, 4, '847885572', '0', '0', 'Bs.'),
        (94, 16, '00008', 1, 1, '233', '0', '0', 'GWh'),
        (99, 16, '00008', 6, 2, '246', '0', '0', 'GWh'),
        (105, 16, '00008', 12, 4, '243', '0', '0', 'GWh'),
        (98, 16, '00008', 5, 2, '255', '0', '0', 'GWh'),
        (97, 16, '00008', 4, 2, '249', '0', '0', 'GWh'),
        (96, 16, '00008', 3, 1, '251', '0', '0', 'GWh'),
        (95, 16, '00008', 2, 1, '234', '0', '0', 'GWh'),
        (100, 16, '00008', 7, 3, '248', '0', '0', 'GWh'),
        (101, 16, '00008', 8, 3, '250', '0', '0', 'GWh'),
        (102, 16, '00008', 9, 3, '253', '0', '0', 'GWh'),
        (10, 9, '00001', 1, 1, '1127695', '1100254', '0.98', 'Usuarios Atendidos')
)
INSERT INTO samc.samc_meta_fisica (acc_esp_id, mes_id, trimestre_id, programado, ejecutado, eficacia, unidad_medida)
SELECT
    a.new_id,
    m.new_id,
    COALESCE(t.new_id, (SELECT id FROM samc.samc_trimestre WHERE nombre = 'PRIMER TRIMESTRE')),
    NULLIF(d.programado_str, '')::NUMERIC(18,2),
    NULLIF(d.ejecutado_str, '')::NUMERIC(18,2),
    NULLIF(d.eficacia_str, '')::NUMERIC(5,2),
    NULLIF(d.unidad_medida, '')
FROM mf_data d
JOIN _map_accion a ON a.old_id = d.acc_esp_old_id
JOIN _map_mes m    ON m.old_id = d.mes_old_id
LEFT JOIN _map_trimestre t ON t.old_id = d.trimestre_old_id;

-- 3b. samc_meta_financiera (10 filas)
WITH mf_fin_data(mf_id, acc_esp_old_id, partida_old_id, mes_old_id, trimestre_old_id, programado_str, ejecutado_str, eficacia_str) AS (
    VALUES
        (1,  2, 1, 1,  1, '23654',   '0', '0'),
        (2,  2, 2, 1,  1, '56983',   '0', '0'),
        (3,  2, 5, 1,  1, '698754',  '0', '0'),
        (4,  2, 1, 2,  1, '698745',  '0', '0'),
        (5,  2, 1, 3,  1, '365845',  '0', '0'),
        (6,  2, 1, 4,  2, '69874521','0', '0'),
        (7,  2, 1, 5,  2, '658475',  '0', '0'),
        (8,  5, 1, 1,  1, '235452',  '0', '0'),
        (9,  5, 2, 1,  1, '36547',   '0', '0'),
        (10, 5, 3, 1,  1, '684521',  '0', '0')
)
INSERT INTO samc.samc_meta_financiera (acc_esp_id, partida_id, mes_id, trimestre_id, programado, ejecutado, eficacia)
SELECT
    a.new_id, p.new_id, m.new_id,
    COALESCE(t.new_id, (SELECT id FROM samc.samc_trimestre WHERE nombre = 'PRIMER TRIMESTRE')),
    NULLIF(d.programado_str, '')::NUMERIC(18,2),
    NULLIF(d.ejecutado_str, '')::NUMERIC(18,2),
    NULLIF(d.eficacia_str, '')::NUMERIC(5,2)
FROM mf_fin_data d
JOIN _map_accion a   ON a.old_id    = d.acc_esp_old_id
JOIN _map_partida p  ON p.old_id    = d.partida_old_id
JOIN _map_mes m      ON m.old_id    = d.mes_old_id
LEFT JOIN _map_trimestre t ON t.old_id = d.trimestre_old_id;

-- ============================================================================
-- 4. PERSONAL
-- ============================================================================

-- 4a. samc_persona (8 filas)
WITH data(trab_id, cedula, nombres, apellidos, cod) AS (
    VALUES
        (1, 'TRAB-1', 'ALEJANDRO CONSTANTINO', 'KELERIS BUCARITO', ''),
        (5, 'TRAB-5', 'CAROLINA',              'APONTE',           ''),
        (6, 'TRAB-6', 'YUVIRY',                'BOCOURT ANDUEZA',  ''),
        (4, 'TRAB-4', 'HAYDEE CECILIA',        'GUILLEN PUENTES',  ''),
        (3, 'TRAB-3', 'ADRIAN ENRIQUE',        'CORREA GRIMAM',    ''),
        (2, 'TRAB-2', 'DIEGO SEBASTIAN',       'PEYRANO MULLIN',   ''),
        (8, 'TRAB-8', 'MARÍA NORMA',           'CIOCCIO DEGONZALEZ',''),
        (7, 'TRAB-7', 'CHERRY ARQUIMEDES',     'CEDRE SILVA',      '')
)
INSERT INTO samc.samc_persona (cedula, nombres, apellidos)
SELECT cedula, nombres, apellidos FROM data;

-- 4b. samc_cargo_historico (8 filas)
WITH data(trab_old_id, gerencia_old_id, cargo_old_id, rol_old_id, estado_old_id, region_old_id, fecha_inicio) AS (
    VALUES
        (1, 1, 1, 1, 35, 1, '2023-01-01'::DATE),
        (5, 4, 2, 2, 36, 10, '2023-01-01'),
        (6, 5, 2, 2, 36, 10, '2023-01-01'),
        (4, 2, 2, 2, 36, 10, '2023-01-01'),
        (3, 7, 2, 2, 36, 10, '2023-01-01'),
        (2, 6, 3, 3, 36, 10, '2023-01-01'),
        (8, 3, 2, 2, 36, 10, '2023-01-01'),
        (7, 8, 4, 3, 36, 10, '2023-01-01')
)
INSERT INTO samc.samc_cargo_historico (persona_id, gerencia_id, cargo_id, rol_id, estado_id, region_id, fecha_inicio, es_actual)
SELECT
    p.id, g.new_id, c.new_id, r.new_id, e.new_id, reg.new_id,
    d.fecha_inicio, true
FROM data d
JOIN samc.samc_persona p ON p.cedula = 'TRAB-' || d.trab_old_id
JOIN _map_gerencia g   ON g.old_id    = d.gerencia_old_id
JOIN _map_cargo c      ON c.old_id    = d.cargo_old_id
JOIN _map_rol r        ON r.old_id    = d.rol_old_id
JOIN _map_estado e     ON e.old_id    = d.estado_old_id
JOIN _map_region reg   ON reg.old_id  = d.region_old_id;

-- ============================================================================
-- FIN — Pendiente: parroquias, urbanizaciones y validación final
-- (Ejecutar 03_migracion_completa.py para completar)
-- ============================================================================

COMMIT;
