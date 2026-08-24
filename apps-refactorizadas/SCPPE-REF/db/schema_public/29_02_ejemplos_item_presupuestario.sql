-- ============================================================================
-- FASE 29: DATOS DE EJEMPLO - ITEMS PRESUPUESTARIOS
-- Fecha: 2026-03-09
-- Descripción: Inserción de datos de ejemplo basados en formato 2027
-- ============================================================================

-- ============================================================================
-- 1. CREAR PARTIDAS PRESUPUESTARIAS DE EJEMPLO (si no existen)
-- ============================================================================

-- Verificar si existen las partidas, si no, crearlas
DO $$
DECLARE
    v_accion_id UUID;
    v_partida_402 UUID;
    v_partida_403 UUID;
    v_partida_404 UUID;
    v_partida_405 UUID;
BEGIN
    -- Obtener ID de la acción específica
    SELECT id INTO v_accion_id 
    FROM accion_especifica 
    WHERE nombre LIKE '%Relevamiento%' 
    LIMIT 1;
    
    IF v_accion_id IS NULL THEN
        RAISE NOTICE 'No se encontró acción específica. Creando datos de ejemplo...';
        RETURN;
    END IF;
    
    -- Crear Partida 402 si no existe
    IF NOT EXISTS (SELECT 1 FROM partida_presupuestaria WHERE codigo = '402' AND accion_especifica_id = v_accion_id) THEN
        INSERT INTO partida_presupuestaria (accion_especifica_id, codigo, nombre, descripcion, monto_presupuestado, justificacion)
        VALUES (v_accion_id, '402', 'Servicios Personales / Contratos', 'Contratación de servicios profesionales para desarrollo de sistemas', 42000000, 'Servicios de innovación, automatización y desarrollo tecnológico')
        RETURNING id INTO v_partida_402;
        RAISE NOTICE 'Partida 402 creada: %', v_partida_402;
    ELSE
        SELECT id INTO v_partida_402 FROM partida_presupuestaria WHERE codigo = '402' AND accion_especifica_id = v_accion_id;
        RAISE NOTICE 'Partida 402 ya existe: %', v_partida_402;
    END IF;
    
    -- Crear Partida 403 si no existe
    IF NOT EXISTS (SELECT 1 FROM partida_presupuestaria WHERE codigo = '403' AND accion_especifica_id = v_accion_id) THEN
        INSERT INTO partida_presupuestaria (accion_especifica_id, codigo, nombre, descripcion, monto_presupuestado, justificacion)
        VALUES (v_accion_id, '403', 'Servicios No Personales', 'Servicios de infraestructura, licencias y conectividad', 8500000, 'Servicios necesarios para el funcionamiento del proyecto')
        RETURNING id INTO v_partida_403;
        RAISE NOTICE 'Partida 403 creada: %', v_partida_403;
    ELSE
        SELECT id INTO v_partida_403 FROM partida_presupuestaria WHERE codigo = '403' AND accion_especifica_id = v_accion_id;
        RAISE NOTICE 'Partida 403 ya existe: %', v_partida_403;
    END IF;
    
    -- Crear Partida 404 si no existe
    IF NOT EXISTS (SELECT 1 FROM partida_presupuestaria WHERE codigo = '404' AND accion_especifica_id = v_accion_id) THEN
        INSERT INTO partida_presupuestaria (accion_especifica_id, codigo, nombre, descripcion, monto_presupuestado, justificacion)
        VALUES (v_accion_id, '404', 'Materiales y Suministros / Equipamiento', 'Equipos de cómputo, redes y mobiliario', 12149000, 'Equipamiento necesario para el desarrollo del proyecto')
        RETURNING id INTO v_partida_404;
        RAISE NOTICE 'Partida 404 creada: %', v_partida_404;
    ELSE
        SELECT id INTO v_partida_404 FROM partida_presupuestaria WHERE codigo = '404' AND accion_especifica_id = v_accion_id;
        RAISE NOTICE 'Partida 404 ya existe: %', v_partida_404;
    END IF;
    
    -- La partida 405 ya existe, obtener su ID
    SELECT id INTO v_partida_405 FROM partida_presupuestaria WHERE codigo = '405' AND accion_especifica_id = v_accion_id;
    RAISE NOTICE 'Partida 405: %', v_partida_405;
    
    -- ============================================================================
    -- 2. INSERTAR ELEMENTOS (sub-partidas)
    -- ============================================================================
    
    -- Elementos de 402 (Servicios Personales)
    IF v_partida_402 IS NOT NULL THEN
        INSERT INTO partida_elemento (partida_presupuestaria_id, codigo, nombre, descripcion)
        VALUES 
            (v_partida_402, '01', 'Desarrollo de Software', 'Servicios de desarrollo de aplicaciones'),
            (v_partida_402, '05', 'Formación y Capacitación', 'Servicios de formación del equipo')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- Elementos de 403 (Servicios No Personales)
    IF v_partida_403 IS NOT NULL THEN
        INSERT INTO partida_elemento (partida_presupuestaria_id, codigo, nombre, descripcion)
        VALUES 
            (v_partida_403, '04', 'Servicios Básicos', 'Electricidad, agua, gas, teléfonos'),
            (v_partida_403, '04.05', 'Servicio de Comunicaciones', 'Planes de datos y conectividad'),
            (v_partida_403, '18', 'Impuestos Indirectos', 'IVA y otros impuestos')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- Elementos de 404 (Materiales y Suministros)
    IF v_partida_404 IS NOT NULL THEN
        INSERT INTO partida_elemento (partida_presupuestaria_id, codigo, nombre, descripcion)
        VALUES 
            (v_partida_404, '05', 'Equipos de Comunicaciones', 'Equipos de telecomunicaciones'),
            (v_partida_404, '09', 'Mobiliario y Equipos de Oficina', 'Mobiliario y equipos de trabajo'),
            (v_partida_404, '10', 'Productos Varios', 'Útiles y materiales diversos')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- ============================================================================
    -- 3. INSERTAR ITEMS DE EJEMPLO (basados en formato 2027)
    -- ============================================================================
    
    -- Items de 402 (Servicios Personales)
    IF v_partida_402 IS NOT NULL THEN
        INSERT INTO item_presupuestario (
            partida_presupuestaria_id, codigo, nombre, descripcion, 
            cantidad, unidad_medida, costo_unitario, tipo_item,
            tipo_reemplazo, justificacion, estado
        )
        VALUES 
            (v_partida_402, '402-001', 'Arquitecto de Software', 'Diseño de arquitectura de sistemas',
             12, 'Meses', 350000, 'RECURSO_HUMANO', 'NUEVO', 'Diseño y planificación de la arquitectura del sistema', 'EN_PROCESO'),
            (v_partida_402, '402-002', 'Programador FullStack (Sr.)', 'Desarrollo de aplicaciones web y móviles',
             12, 'Meses', 330000, 'RECURSO_HUMANO', 'NUEVO', 'Desarrollo del sistema principal', 'EN_PROCESO'),
            (v_partida_402, '402-003', 'Programador FullStack (Jr.)', 'Desarrollo de aplicaciones web y móviles',
             12, 'Meses', 280000, 'RECURSO_HUMANO', 'NUEVO', 'Apoyo en desarrollo', 'PENDIENTE'),
            (v_partida_402, '402-004', 'DBA - Analista de Datos', 'Administración de bases de datos',
             12, 'Meses', 330000, 'RECURSO_HUMANO', 'NUEVO', 'Gestión de datos del proyecto', 'EN_PROCESO'),
            (v_partida_402, '402-005', 'Ingeniero de Calidad (QA)', 'Pruebas y aseguramiento de calidad',
             9, 'Meses', 310000, 'RECURSO_HUMANO', 'NUEVO', 'Control de calidad del software', 'PENDIENTE'),
            (v_partida_402, '402-006', 'Programador Frontend / UI-UX', 'Desarrollo de interfaces de usuario',
             9, 'Meses', 310000, 'RECURSO_HUMANO', 'NUEVO', 'Diseño y desarrollo de interfaces', 'PENDIENTE'),
            (v_partida_402, '402-007', 'Programador Backend / Seguridad', 'Desarrollo de servicios y seguridad',
             12, 'Meses', 330000, 'RECURSO_HUMANO', 'NUEVO', 'Desarrollo de APIs y seguridad', 'EN_PROCESO'),
            (v_partida_402, '402-008', 'Analista de Sistemas Funcional', 'Análisis de requerimientos funcionales',
             12, 'Meses', 280000, 'RECURSO_HUMANO', 'NUEVO', 'Análisis y documentación de requerimientos', 'EN_PROCESO'),
            (v_partida_402, '402-009', 'Ingeniero de Redes y Ciberseguridad', 'Configuración de redes y seguridad',
             6, 'Meses', 310000, 'RECURSO_HUMANO', 'NUEVO', 'Implementación de infraestructura de red', 'PENDIENTE'),
            (v_partida_402, '402-010', 'Subtotal Formación', 'Capacitación del equipo técnico',
             12, 'Meses', 260000, 'RECURSO_HUMANO', 'NUEVO', 'Formación y capacitación continua', 'PENDIENTE')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- Items de 403 (Servicios No Personales)
    IF v_partida_403 IS NOT NULL THEN
        INSERT INTO item_presupuestario (
            partida_presupuestaria_id, codigo, codigo_snc, nombre, descripcion,
            especificacion_tecnica, cantidad, unidad_medida, costo_unitario, tipo_item,
            tipo_servicio, periodo_facturacion, justificacion, estado
        )
        VALUES 
            (v_partida_403, '403-IaaS-01', NULL, 'Infraestructura en la Nube (IaaS)', 'Servicio de infraestructura cloud',
             '4TB storage, 2 VMs, respaldos cifrados, 99.5% SLA', 1, 'Servicio anual', 5000000, 'SERVICIO',
             'Alquiler', 'Anual', 'Alojamiento de data crítica con cifrado ISO 27001', 'EN_PROCESO'),
            (v_partida_403, '403-LIC-01', NULL, 'Suscripción JetBrains All Products', 'Licencias de desarrollo',
             'JetBrains All Products + Visual Studio Enterprise', 12, 'Licencias/mes', 80000, 'SERVICIO',
             'Licencia', 'Mensual', 'Entornos de desarrollo integrados para 9 desarrolladores', 'EN_PROCESO'),
            (v_partida_403, '403-LIC-02', NULL, 'Suscripción Enterprise Architect (CASE)', 'Herramienta de modelado',
             'Enterprise Architect para modelado UML', 11, 'Licencias/año', 70000, 'SERVICIO',
             'Licencia', 'Anual', 'Herramienta de modelado de arquitectura de software', 'PENDIENTE'),
            (v_partida_403, '403-LIC-03', NULL, 'Antivirus Corporativo', 'Protección de endpoints',
             '11 licencias antivirus corporativo', 11, 'Licencias/año', 24545, 'SERVICIO',
             'Licencia', 'Anual', 'Protección endpoints del equipo técnico', 'EN_PROCESO'),
            (v_partida_403, '403-MANT-01', NULL, 'Mantenimiento preventivo/correctivo de equipos', 'Mantenimiento de hardware',
             'Mantenimiento de estaciones de trabajo, laptops e impresora', 1, 'Servicio anual', 800000, 'SERVICIO',
             'Mantenimiento', 'Anual', 'Mantenimiento preventivo y correctivo de equipos', 'PENDIENTE'),
            (v_partida_403, '403-CON-01', NULL, 'Conectividad - Plan datos móviles corporativos', 'Planes de datos',
             'Planes de datos para formadores y equipo de campo', 12, 'Meses', 58333, 'SERVICIO',
             'Conectividad', 'Mensual', 'Planes de datos para formadores y equipo de campo', 'EN_PROCESO'),
            (v_partida_403, '403-IVA-01', NULL, 'Impuesto al Valor Agregado (IVA 16%)', 'Impuestos',
             'IVA 16% sobre servicios', 1, 'Porcentaje', 5782440000, 'SERVICIO',
             'Impuesto', 'Único', 'Impuesto al valor agregado sobre servicios', 'PENDIENTE')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- Items de 404 (Materiales y Suministros)
    IF v_partida_404 IS NOT NULL THEN
        INSERT INTO item_presupuestario (
            partida_presupuestaria_id, codigo, nombre, descripcion,
            especificacion_tecnica, cantidad, unidad_medida, costo_unitario, tipo_item,
            marca, modelo, vida_util_meses, estado_activo, justificacion, estado
        )
        VALUES 
            (v_partida_404, '404-EQ-01', 'Estación de Trabajo Desktop Gama Alta', 'Computadoras de escritorio',
             'Intel Core i7-14700, 32GB DDR5, SSD 1TB NVMe, Fuente 650W 80+ Gold', 9, 'Unidad', 480000, 'ACTIVO',
             ' Dell', 'OptiPlex', 60, 'NUEVO', 'Equipos de trabajo para desarrolladores', 'EN_PROCESO'),
            (v_partida_404, '404-EQ-02', 'Kit Monitores Profesionales Dual (27")', 'Monitores de alta resolución',
             '2 Monitores 27" IPS QHD (2560x1440), 75Hz, 99% sRGB, ergonómico', 9, 'Kit', 240000, 'ACTIVO',
             'Samsung', 'ViewFinity', 72, 'NUEVO', 'Monitores para trabajo de diseño y desarrollo', 'PENDIENTE'),
            (v_partida_404, '404-EQ-03', 'UPS Line-Interactive con AVR 1500VA', 'Protección eléctrica',
             'UPS Line-Interactive 1500VA/900W, AVR 3 niveles, 15-20 min autonomía', 9, 'Unidad', 85000, 'ACTIVO',
             'APC', 'Back-UPS', 60, 'NUEVO', 'Protección contra cortes de energía', 'PENDIENTE'),
            (v_partida_404, '404-EQ-04', 'Laptop Técnica de Campo (MIL-STD-810H)', 'Equipos móviles',
             'ThinkPad/Dell Latitude, i7/Ryzen 7 PRO, 32GB DDR5, SSD 1TB, MIL-STD-810H', 4, 'Unidad', 320000, 'ACTIVO',
             'Lenovo', 'ThinkPad', 48, 'NUEVO', 'Equipos para trabajo en campo', 'PENDIENTE'),
            (v_partida_404, '404-EQ-05', 'Impresora Láser Multifuncional Enterprise', 'Impresión',
             'Brother/HP Enterprise, 45 PPM, 75K páginas/mes, dúplex, Ethernet/USB/WiFi', 1, 'Unidad', 450000, 'ACTIVO',
             'HP', 'LaserJet', 60, 'NUEVO', 'Impresora para documentos del proyecto', 'PENDIENTE'),
            (v_partida_404, '404-EQ-06', 'Consumibles Impresora (Kit Anual)', 'Repuestos de impresora',
             'Kit anual: 2 tóners alta capacidad + tambor + kit mantenimiento', 1, 'Kit', 250000, 'MATERIAL',
             NULL, NULL, NULL, NULL, 'Consumibles para impresora', 'PENDIENTE'),
            (v_partida_404, '404-EQ-07', 'Switch de Red 24 Puertos + Latiguillos', 'Equipos de red',
             'Switch 24 puertos Gigabit Ethernet, no administrable, 20 latiguillos Cat6', 1, 'Kit', 70000, 'ACTIVO',
             'Cisco', 'Catalyst', 60, 'NUEVO', 'Conectividad de red local', 'PENDIENTE'),
            (v_partida_404, '404-EQ-08', 'Reguladores de Voltaje Secundarios', 'Protección eléctrica',
             'Supresor picos >2000 Joule, filtro EMI/RFI, regleta multicontacto', 9, 'Unidad', 7143, 'ACTIVO',
             'APC', 'PowerStrip', 36, 'NUEVO', 'Protección contra picos de voltaje', 'PENDIENTE'),
            (v_partida_404, '404-EQ-09', 'Kit Accesorios y Periféricos (Teclado+Mouse+Pad)', 'Periféricos',
             'Teclado mecánico (rojos) + Mouse ergonómico + Pad programador', 9, 'Kit', 25000, 'MATERIAL',
             NULL, NULL, NULL, NULL, 'Periféricos para estaciones de trabajo', 'PENDIENTE'),
            (v_partida_404, '404-EQ-10', 'Smartphone Samsung Galaxy XCover7', 'Teléfonos móviles',
             'Samsung Galaxy XCover7, IP68, MIL-STD-810H, batería extraíble 4050mAh', 2, 'Unidad', 18900, 'ACTIVO',
             'Samsung', 'Galaxy XCover7', 36, 'NUEVO', 'Teléfonos para equipo de campo', 'PENDIENTE'),
            (v_partida_404, '404-EQ-11', 'SIM Corporativa 5G Smartphones (12 meses)', 'Conectividad móvil',
             'Plan datos ilimitados 5G MOVILNET, 6 USD/mes, cobertura nacional', 2, 'Línea/mes', 270, 'SERVICIO',
             'MOVILNET', '5G', 12, NULL, 'Planes de datos para smartphones', 'PENDIENTE'),
            (v_partida_404, '404-EQ-12', 'Tablet Samsung Galaxy Tab S10 FE 5G 10.9"', 'Tablets',
             'Samsung Galaxy Tab S10 FE 5G, 10.9" WQXGA, 8GB/128GB, S Pen, 8000mAh', 3, 'Unidad', 500000, 'ACTIVO',
             'Samsung', 'Galaxy Tab S10', 36, 'NUEVO', 'Tablets para formadores y campo', 'PENDIENTE'),
            (v_partida_404, '404-EQ-13', 'Fundas y Protectores para Tablets', 'Accesorios tablets',
             'Funda cuero sintético multiángulo + Mica templada 9H', 3, 'Kit', 20000, 'MATERIAL',
             NULL, NULL, NULL, NULL, 'Protectores para tablets', 'PENDIENTE'),
            (v_partida_404, '404-EQ-14', 'SIM Corporativa 5G Tablets (12 meses)', 'Conectividad móvil tablets',
             'Plan datos ilimitados 5G MOVILNET para tablet, 6 USD/mes', 3, 'Línea/mes', 270, 'SERVICIO',
             'MOVILNET', '5G', 12, NULL, 'Planes de datos para tablets', 'PENDIENTE')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    -- Items de 405 (Viáticos) - ya existen en tabla viatico, pero agregar a item_presupuestario
    IF v_partida_405 IS NOT NULL THEN
        INSERT INTO item_presupuestario (
            partida_presupuestaria_id, codigo, nombre, descripcion,
            cantidad, unidad_medida, costo_unitario, tipo_item,
            numero_personas, numero_dias, destino, tipo_viatico, justificacion, estado
        )
        VALUES 
            (v_partida_405, '405-VIA-01', 'Relevamiento de data en 24 estados', 'Desplazamientos para recolección de información',
             4, 'Personas', 20000, 'VIATICO',
             4, 15, 'Nacional (24 estados)', 'NACIONAL', 'Relevamiento de data en estados para el proyecto', 'EN_PROCESO'),
            (v_partida_405, '405-VIA-02', 'Talleres presenciales de capacitación', 'Capacitación presencial',
             2, 'Personas', 25000, 'VIATICO',
             2, 20, 'Nacional (estados)', 'NACIONAL', 'Talleres de capacitación para usuarios', 'PENDIENTE'),
            (v_partida_405, '405-VIA-03', 'Acompañamiento post-implementación y soporte', 'Soporte técnico en campo',
             2, 'Personas', 20000, 'VIATICO',
             2, 15, 'Nacional (estados)', 'NACIONAL', 'Acompañamiento después de la implementación', 'PENDIENTE')
        ON CONFLICT (partida_presupuestaria_id, codigo) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Datos de ejemplo insertados correctamente';
END $$;

-- ============================================================================
-- 4. INSERTAR EJECUCIONES DE EJEMPLO
-- ============================================================================

-- Ejecuciones de ejemplo para items de 402
DO $$
DECLARE
    v_item_id UUID;
BEGIN
    -- Ejecución parcial para Arquitecto de Software
    SELECT id INTO v_item_id FROM item_presupuestario WHERE codigo = '402-001' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        INSERT INTO ejecucion_item (
            item_presupuestario_id, fecha_ejecucion, cantidad_ejecutada, costo_ejecutado,
            comprobante_tipo, comprobante_numero, comprobante_fecha, comprobante_proveedor,
            recibido_por, fecha_recepcion, conformidad, observaciones
        )
        VALUES 
            (v_item_id, '2027-01-15', 1, 350000, 'CONTRATO', 'CONT-2027-001', '2027-01-10', 'TechSolutions C.A.',
             'Juan Pérez', '2027-01-15', TRUE, 'Pago mensual enero 2027'),
            (v_item_id, '2027-02-15', 1, 350000, 'CONTRATO', 'CONT-2027-001', '2027-02-10', 'TechSolutions C.A.',
             'Juan Pérez', '2027-02-15', TRUE, 'Pago mensual febrero 2027')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Ejecución parcial para Programador Sr.
    SELECT id INTO v_item_id FROM item_presupuestario WHERE codigo = '402-002' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        INSERT INTO ejecucion_item (
            item_presupuestario_id, fecha_ejecucion, cantidad_ejecutada, costo_ejecutado,
            comprobante_tipo, comprobante_numero, comprobante_fecha, comprobante_proveedor,
            recibido_por, fecha_recepcion, conformidad, observaciones
        )
        VALUES 
            (v_item_id, '2027-01-15', 1, 330000, 'CONTRATO', 'CONT-2027-002', '2027-01-10', 'DevTeam C.A.',
             'María García', '2027-01-15', TRUE, 'Pago mensual enero 2027'),
            (v_item_id, '2027-02-15', 1, 330000, 'CONTRATO', 'CONT-2027-002', '2027-02-10', 'DevTeam C.A.',
             'María García', '2027-02-15', TRUE, 'Pago mensual febrero 2027')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Ejecución para IaaS
    SELECT id INTO v_item_id FROM item_presupuestario WHERE codigo = '403-IaaS-01' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        INSERT INTO ejecucion_item (
            item_presupuestario_id, fecha_ejecucion, cantidad_ejecutada, costo_ejecutado,
            comprobante_tipo, comprobante_numero, comprobante_fecha, comprobante_proveedor,
            recibido_por, fecha_recepcion, conformidad, observaciones
        )
        VALUES 
            (v_item_id, '2027-01-01', 1, 5000000, 'FACTURA', 'FACT-2027-001', '2027-01-01', 'CloudProvider Venezuela',
             'Carlos López', '2027-01-01', TRUE, 'Pago anual infraestructura cloud')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Ejecución para Estación de Trabajo
    SELECT id INTO v_item_id FROM item_presupuestario WHERE codigo = '404-EQ-01' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        INSERT INTO ejecucion_item (
            item_presupuestario_id, fecha_ejecucion, cantidad_ejecutada, costo_ejecutado,
            comprobante_tipo, comprobante_numero, comprobante_fecha, comprobante_proveedor,
            recibido_por, fecha_recepcion, conformidad, observaciones
        )
        VALUES 
            (v_item_id, '2027-02-01', 3, 1440000, 'ORDEN_COMPRA', 'OC-2027-001', '2027-01-20', 'DistribuidoraTech',
             'Ana Martínez', '2027-02-01', TRUE, 'Entrega parcial: 3 de 9 equipos')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Ejecuciones de ejemplo insertadas correctamente';
END $$;

-- ============================================================================
-- 5. VERIFICACIÓN
-- ============================================================================

-- Mostrar resumen de datos insertados
SELECT 
    'PARTIDAS' AS tabla,
    COUNT(*) AS total
FROM partida_presupuestaria
WHERE activo = TRUE
UNION ALL
SELECT 
    'ELEMENTOS' AS tabla,
    COUNT(*) AS total
FROM partida_elemento
WHERE activo = TRUE
UNION ALL
SELECT 
    'ITEMS' AS tabla,
    COUNT(*) AS total
FROM item_presupuestario
WHERE activo = TRUE
UNION ALL
SELECT 
    'EJECUCIONES' AS tabla,
    COUNT(*) AS total
FROM ejecucion_item
WHERE activo = TRUE;

-- ============================================================================
-- FIN DATOS DE EJEMPLO
-- ============================================================================
