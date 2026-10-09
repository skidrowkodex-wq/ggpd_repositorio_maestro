# -*- coding: utf-8 -*-
"""
Generador de Memorando Técnico Ejecutivo de SIGAD v1.0 en formato .docx
Destinatario: Ing. Carlos Reyes (GGPD CORPOELEC)
Autor: Ing. Yván M. Cipiran N. & Consultoría Senior de Sistemas de Potencia SEN
Normas: ISO 55000 · ISO 8000 · ISO 27001 · CADAFE NS-P-105
Fuente de Datos: Matrices y Archivos Excel de Caracterización del Repositorio GGPD
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Configuración de Márgenes (Estándar 2.0 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Colores Institucionales CORPOELEC
    NAVY = RGBColor(0, 43, 73)       # #002B49 (Azul Corpoelec)
    CYAN = RGBColor(0, 114, 206)     # #0072CE (Azul Eléctrico)
    DARK = RGBColor(30, 41, 59)      # #1E293B (Gris Texto Principal)
    GREY = RGBColor(100, 116, 139)   # #64748B (Gris Secundario)

    # Estilo Normal
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = DARK

    # --------------------------------------------------------------------------
    # ENCABEZADO INSTITUCIONAL
    # --------------------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    run_inst = p_inst.add_run(
        "REPÚBLICA BOLIVARIANA DE VENEZUELA\n"
        "MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)\n"
        "CORPORACIÓN ELÉCTRICA NACIONAL, S.A. (CORPOELEC)\n"
        "GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)"
    )
    run_inst.font.name = 'Calibri'
    run_inst.font.size = Pt(9.5)
    run_inst.font.bold = True
    run_inst.font.color.rgb = NAVY

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # TÍTULO DEL DOCUMENTO
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    run_title = p_title.add_run(
        "DICTAMEN TÉCNICO Y MEMORANDO EJECUTIVO DE ARQUITECTURA\n"
        "SISTEMA INTEGRADO DE GESTIÓN DE ACTIVOS DE DISTRIBUCIÓN (SIGAD v1.0)"
    )
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(14)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    # TABLA DE METADATOS NORMATIVOS ISO
    table_meta = doc.add_table(rows=7, cols=2)
    table_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_meta.autofit = False

    metadata_rows = [
        ("CÓDIGO DE DOCUMENTO", "DOC-GGPD-2026-MEMO-SIGAD-001 / NAC_2026_GGPD_MEMO_TECNICO_SIGAD_ING_CARLOS_REYES_V01"),
        ("PARA", "Ing. Carlos Reyes — Gerencia General de Planificación de Distribución (GGPD)"),
        ("DE", "Ing. Yván M. Cipiran N. — Líder de Automatización e Inteligencia Artificial (GGPD)"),
        ("EN COLABORACIÓN TÉCNICA", "Consultoría Especializada en Sistemas Eléctricos de Potencia & Gestión de Activos SEN"),
        ("MARCO NORMATIVO", "ISO 55000/55001 · ISO 8000-110 · ISO/IEC 27001:2022 · CADAFE NS-P-105 · IEEE 1366 · IEEE 80"),
        ("FUENTE DE DATOS", "Matrices Oficiales de Caracterización y Censos del Repositorio GGPD (Archivos Excel)"),
        ("ESTADO DE ENTREGABLE", "Prototipo Operativo v1.0 (Puerto 3007) · Cero MOCK · Validado para Entrega del Viernes")
    ]

    for idx, (label, val) in enumerate(metadata_rows):
        row = table_meta.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.8)
        
        p0 = cell_lbl.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(9)
        r0.font.color.rgb = NAVY
        
        p1 = cell_val.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(val)
        r1.font.size = Pt(9)
        r1.font.color.rgb = DARK

        set_cell_background(cell_lbl, 'F1F5F9')
        set_cell_background(cell_val, 'FFFFFF')
        set_cell_margins(cell_lbl, top=60, bottom=60, left=100, right=100)
        set_cell_margins(cell_val, top=60, bottom=60, left=100, right=100)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # --------------------------------------------------------------------------
    # 1. OBJETIVO DEL DOCUMENTO
    # --------------------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("1. OBJETIVO DEL DOCUMENTO")
    r_h1.font.color.rgb = NAVY
    r_h1.font.bold = True

    p = doc.add_paragraph(
        "El presente documento tiene como finalidad exponer al Ing. Carlos Reyes el dictamen técnico, la justificación "
        "de ingeniería eléctrica, la resolución forense de datos y la arquitectura de software consolidada para el nacimiento "
        "del Sistema Integrado de Gestión de Activos de Distribución (SIGAD v1.0).\n\n"
        "Este desarrollo ataja y resuelve de manera definitiva la solicitud urgente formulada para este viernes, "
        "transformando un requerimiento tradicionalmente complejo y desarticulado en una solución informática ágil, "
        "automatizada y de grado industrial. SIGAD nace como el núcleo fundacional y fuente única de verdad "
        "de la infraestructura eléctrica de distribución, erradicando la dependencia de las hojas de cálculo dispersas "
        "(\"supersábanas Excel\" del repositorio GGPD) y estableciendo la plataforma sobre la cual se desplegarán "
        "los futuros módulos y herramientas de diagnóstico, mantenimiento e indisponibilidad de la gerencia."
    )
    p.paragraph_format.space_after = Pt(8)

    # --------------------------------------------------------------------------
    # 2. DIAGNÓSTICO FORENSE DEL DOLOR OPERATIVO Y ANTECEDENTES
    # --------------------------------------------------------------------------
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("2. DIAGNÓSTICO FORENSE DEL DOLOR OPERATIVO")
    r_h2.font.color.rgb = NAVY
    r_h2.font.bold = True

    p = doc.add_paragraph(
        "Durante las mesas de trabajo técnicas sostenidas con los especialistas de subestaciones y líneas de distribución, "
        "se identificaron tres quiebres operativos y de gestión que han impedido consolidar una base de datos confiable:"
    )
    p.paragraph_format.space_after = Pt(6)

    bullets_dolor = [
        ("El conocimiento tácito en la psiquis del especialista: ", 
         "Los ingenieros veteranos dominan con exactitud la topología de patio, la nomenclatura de maniobra y la disposición de los equipos; "
         "sin embargo, este conocimiento no se encuentra transferido a los instrumentos cotidianos ni a los analistas de los 24 estados."),
        ("El sesgo del instrumento extenso y la 'Página en Blanco': ", 
         "Los relevamientos solicitados históricamente a los estados consistían en matrices de Excel con más de 80 campos por equipo. "
         "Una subestación típica (115/13.8 kV) posee entre 50 y 90 equipos de patio. Pretender que un analista digite uno a uno cada disyuntor, "
         "seccionador y pararrayos desde cero causó el abandono sistemático del registro o la carga de datos genéricos ficticios para 'cumplir el plazo'."),
        ("El desfase crítico: Transformadores repuestos vs. matrices de indisponibilidad: ", 
         "Cuando un transformador de potencia se quema, se reporta de inmediato en las matrices de contingencia de la gerencia. "
         "Meses después, Mantenimiento instala un transformador de reemplazo (a menudo con otro serial troquelado o capacidad MVA). "
         "La matriz de contingencia se cierra o archiva, pero los censos de activos de la gerencia nunca se enteran del nuevo serial. "
         "Cuando sobreviene una nueva falla en esa instalación, los registros oficiales colapsan por incoherencia de datos."),
        ("La trampa del dibujo manual (AutoCAD vs. Visor Dinámico): ", 
         "Se solicitó incorporar diagramas unifilares. Desde el punto de vista informático, pretender que los analistas dibujaran manualmente "
         "en visores tipo AutoCAD habría tomado meses de desarrollo e introducido errores humanos. La respuesta de ingeniería fue deconstruir "
         "el problema: lo que la GGPD requiere es un motor topológico vivo que, leyendo los equipos reales de la base de datos, proyecte el "
         "diagrama esquemático automáticamente en tiempo real.")
    ]

    for title, desc in bullets_dolor:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_t = bp.add_run(title)
        r_t.font.bold = True
        r_t.font.color.rgb = CYAN
        r_d = bp.add_run(desc)
        r_d.font.color.rgb = DARK

    # --------------------------------------------------------------------------
    # 3. IDENTIDAD INSTITUCIONAL: ¿POR QUÉ SIGAD Y NO ATLAS CADAFE?
    # --------------------------------------------------------------------------
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("3. DECISIÓN ESTRATÉGICA: SIGAD vs. ATLAS CADAFE")
    r_h3.font.color.rgb = NAVY
    r_h3.font.bold = True

    p = doc.add_paragraph(
        "Se evaluó revivir comercialmente el histórico nombre 'ATLAS CADAFE', ampliamente recordado en la empresa. "
        "El análisis estratégico arrojó la necesidad de dar un salto hacia la innovación y la gestión del cambio:"
    )
    p.paragraph_format.space_after = Pt(6)

    # Tabla Comparativa
    table_comp = doc.add_table(rows=5, cols=3)
    table_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_comp.autofit = False

    comp_headers = ["CRITERIO TÉCNICO", "ENFOQUE 'ATLAS CADAFE'", "ENFOQUE 'SIGAD' (ADOPTADO)"]
    for c_idx, h_text in enumerate(comp_headers):
        cell = table_comp.rows[0].cells[c_idx]
        p_h = cell.paragraphs[0]
        r = p_h.add_run(h_text)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, '002B49')
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    table_comp.rows[0].cells[0].width = Inches(1.8)
    table_comp.rows[0].cells[1].width = Inches(2.5)
    table_comp.rows[0].cells[2].width = Inches(2.7)

    comp_data = [
        ("Percepción del Usuario", "Nostalgia del pasado; transmite la idea de volver a lo anterior sin innovación.", "Modernidad, liderazgo y transformación hacia el estándar 2026."),
        ("Marco Normativo", "Registro gráfico estático de esquemas y planos en papel o PDF.", "Alineación integral con ISO 55000 / 55001 (Ciclo de Vida de Activos)."),
        ("Gobierno de Datos", "Archivos dispersos y difícil trazabilidad.", "Gobernanza estricta ISO 8000-110 con auditoría ISO/IEC 27001."),
        ("Visión de Ecosistema", "Documento aislado sin capacidad modular.", "Núcleo fundacional: Plataforma central de la cual derivarán los futuros módulos de la GGPD.")
    ]

    for r_idx, row_vals in enumerate(comp_data):
        row = table_comp.rows[r_idx + 1]
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            p_c = cell.paragraphs[0]
            p_c.paragraph_format.space_after = Pt(2)
            r = p_c.add_run(val)
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY
                set_cell_background(cell, 'F8FAFC')
            elif c_idx == 2:
                r.font.bold = True
                r.font.color.rgb = CYAN
                set_cell_background(cell, 'F0FDF4')
            else:
                set_cell_background(cell, 'FFFFFF')
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)

    p_nota = doc.add_paragraph()
    p_nota.paragraph_format.space_before = Pt(6)
    p_nota.paragraph_format.space_after = Pt(10)
    r_nota = p_nota.add_run("Dictamen: Se formaliza SIGAD como la plataforma corporativa sombrilla, manteniendo el 'Atlas Topológico SEN' como su módulo interno de proyección unifilar en tiempo real.")
    r_nota.font.italic = True
    r_nota.font.bold = True
    r_nota.font.color.rgb = NAVY

    # --------------------------------------------------------------------------
    # 4. RESOLUCIÓN FORENSE DEL INVENTARIO NACIONAL (CERO MOCK)
    # --------------------------------------------------------------------------
    h4 = doc.add_heading(level=1)
    r_h4 = h4.add_run("4. TRATAMIENTO DE LA DATA MAESTRA (CERO MOCK)")
    r_h4.font.color.rgb = NAVY
    r_h4.font.bold = True

    p = doc.add_paragraph(
        "El desarrollo acató estrictamente el principio de CERO MOCK. No se crearon seriales ni marcas inventadas. "
        "La base de datos de SIGAD se alimentó directamente de las matrices oficiales de caracterización del repositorio de la GGPD:\n"
        "• 871 Subestaciones Eléctricas Reales (Censo nacional de instalaciones de distribución y nodos de subtransmisión).\n"
        "• 4.207 Circuitos de Distribución Reales (Alimentadores y troncales aéreas y subterráneas del SEN)."
    )
    p.paragraph_format.space_after = Pt(6)

    # Subsección Bejuma
    h4_1 = doc.add_heading(level=2)
    r_h4_1 = h4_1.add_run("4.1. Caso Emblemático: S/E BEJUMA (SE-CAR-0216)")
    r_h4_1.font.color.rgb = CYAN

    p = doc.add_paragraph(
        "Durante las pruebas preliminares, los circuitos de la subestación BEJUMA se mostraban como 'undefined'. "
        "La investigación forense en los archivos de la gerencia reveló que en las tablas maestras el nombre oficial del circuito "
        "está rotulado como 'circuito' o 'nombre_ct_norm' (y no como 'nombre_circuito'), conteniendo además caracteres residuales como "
        "asteriscos de ex-operadoras (ej. SABANETA****).\n\n"
        "Se implementó un saneamiento en catalogService.ts que normalizó los 4.207 circuitos de la República, descubriendo y vinculando "
        "de forma limpia los 7 circuitos reales que operan desde BEJUMA (Carabobo):"
    )
    p.paragraph_format.space_after = Pt(6)

    table_bej = doc.add_table(rows=8, cols=4)
    table_bej.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_bej.autofit = False

    bej_headers = ["CÓDIGO CANÓNICO", "NOMBRE OFICIAL NORMALIZADO", "NIVEL DE TENSIÓN", "TIPO DE RED"]
    for c_idx, h_text in enumerate(bej_headers):
        cell = table_bej.rows[0].cells[c_idx]
        p_h = cell.paragraphs[0]
        r = p_h.add_run(h_text)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, '0072CE')
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)

    bej_data = [
        ("CT-CAR-00926", "BEJUMA", "13.8 kV", "AÉREO"),
        ("CT-CAR-00927", "CANOABO", "13.8 kV", "AÉREO"),
        ("CT-CAR-00928", "CHIRGUA", "13.8 kV", "AÉREO"),
        ("CT-CAR-00929", "EL RINCON", "13.8 kV", "AÉREO"),
        ("CT-CAR-00930", "HOSPITAL", "13.8 kV", "AÉREO"),
        ("CT-CAR-00931", "PEDECA", "13.8 kV", "AÉREO"),
        ("CT-CAR-00932", "SABANETA (Saneado de SABANETA****)", "34.5 kV", "AÉREO")
    ]

    for r_idx, row_vals in enumerate(bej_data):
        row = table_bej.rows[r_idx + 1]
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            p_c = cell.paragraphs[0]
            p_c.paragraph_format.space_after = Pt(2)
            r = p_c.add_run(val)
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.font.bold = True
                r.font.name = 'Consolas'
                r.font.color.rgb = NAVY
            elif c_idx == 2:
                r.font.bold = True
                r.font.color.rgb = CYAN
            set_cell_background(cell, 'F8FAFC' if r_idx % 2 == 0 else 'FFFFFF')
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # --------------------------------------------------------------------------
    # 5. INGENIERÍA DEL MOTOR TOPOLÓGICO DE BAHÍAS (CADAFE NS-P-105)
    # --------------------------------------------------------------------------
    h5 = doc.add_heading(level=1)
    r_h5 = h5.add_run("5. EL MOTOR TOPOLÓGICO DE BAHÍAS (CADAFE NS-P-105)")
    r_h5.font.color.rgb = NAVY
    r_h5.font.bold = True

    p = doc.add_paragraph(
        "Para solucionar el problema del agotamiento en campo, se diseñó el Motor Estructural CADAFE NS-P-105. "
        "El motor reproduce fielmente la ingeniería de subestaciones de distribución en 5 bloques modulares autogenerados en 1 clic:"
    )
    p.paragraph_format.space_after = Pt(6)

    bloques = [
        ("1. Bahías de Transformación AT (TRANSFORMACION_AT): ", 
         "Transformador de Potencia (TR-1, TR-2), Disyuntor de Entrada (D1 en SF6/Vacío), Seccionador de Corte Visible (S1), "
         "Transformadores de Corriente (TC-1 para protección diferencial 87T) y Pararrayos de Entrada (PA-1 de Óxido de Zinc)."),
        ("2. Bahía de Barras de Distribución MT (BARRAS_MT): ", 
         "Barras Colectoras MT (B1, B2 en 13.8 kV o 34.5 kV) e Interruptor de Acoplamiento de Barras (D-ACOP) o Transferencia (D-TRANSF)."),
        ("3. Bahías de Salida de Circuitos (CIRCUITO_SALIDA): ", 
         "Una bahía dedicada por cada alimentador real confirmado, con su Interruptor/Reconectador de Cabecera (REC-X), "
         "Seccionador de Salida (S-CTO-X), TC de Medición/Sobrecorriente (50/51) y Pararrayos de Salida (PA-CTO-X)."),
        ("4. Bahía de Servicios Auxiliares SSAA (SERVICIOS_AUXILIARES): ", 
         "Sistemas vitales: Banco de Baterías de Control (BAT-1 en 125 Vdc), Rectificador/Cargador (RECT-1), "
         "Transformador de Servicios Auxiliares MT/BT (TR-SSAA) y Grupo Electrógeno Diésel de Emergencia (GE-1)."),
        ("5. Bahía de Infraestructura Civil y Seguridad de Patio (INFRAESTRUCTURA_CIVIL): ", 
         "Malla de Puesta a Tierra bajo norma IEEE 80 (MAT-TIERRA), Manto de Grava/Piedra Picada para tensiones de paso y contacto, "
         "y Cercado Perimetral con Alumbrado de Seguridad.")
    ]

    for title, desc in bloques:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_t = bp.add_run(title)
        r_t.font.bold = True
        r_t.font.color.rgb = NAVY
        r_d = bp.add_run(desc)
        r_d.font.color.rgb = DARK

    # --------------------------------------------------------------------------
    # 6. EL FLUJO DE CO-VALIDACIÓN POR EL ESTADO
    # --------------------------------------------------------------------------
    h6 = doc.add_heading(level=1)
    r_h6 = h6.add_run("6. CO-VALIDACIÓN Y CONFIRMACIÓN POR EL ESTADO")
    r_h6.font.color.rgb = NAVY
    r_h6.font.bold = True

    p = doc.add_paragraph(
        "Un aporte metodológico fundamental acordado en la sesión fue que el sistema no debe imponer la data a ciegas. "
        "Cuando el analista estadal presiona [⚡ Auto-Generar / Regenerar Esqueleto CADAFE], se despliega el Modal de Confirmación Estadal "
        "(RegenerateCadafeModal.tsx) que cumple las siguientes funciones:\n\n"
        "1. Validación Humana en el Bucle: El sistema presenta la lista de circuitos mapeados en las matrices de la GGPD con casillas de verificación. "
        "El ingeniero valida cuáles operan efectivamente en patio y desmarca alimentadores transferidos o desincorporados.\n"
        "2. Adición de Salidas Nuevas: Si en campo se inauguró una salida reciente no registrada en los censos centrales, el ingeniero puede añadirla en el acto.\n"
        "3. Configuración Topológica: Permite seleccionar si la S/E tiene 1, 2, 3 o 4 transformadores de potencia, su capacidad nominal (MVA) "
        "y su esquema de barras (Simple Barra, Doble Barra o Transferencia).\n"
        "4. Preservación de Datos de Placa: Si el usuario ya había digitado seriales troquelados o marcas y desea regenerar para incluir un nuevo circuito, "
        "el sistema ofrece la opción de preservar íntegros los datos de placa cargados previamente, evitando retrabajos."
    )
    p.paragraph_format.space_after = Pt(8)

    # --------------------------------------------------------------------------
    # 7. EL TRATAMIENTO DE LAS SUBESTACIONES MÓVILES
    # --------------------------------------------------------------------------
    h7 = doc.add_heading(level=1)
    r_h7 = h7.add_run("7. EL TRATAMIENTO DE LAS SUBESTACIONES MÓVILES")
    r_h7.font.color.rgb = NAVY
    r_h7.font.bold = True

    p = doc.add_paragraph(
        "Se abordó y resolvió con precisión técnica la inclusión de las Subestaciones Móviles en el inventario nacional:\n\n"
        "• Realidad Operativa del SEN: En Venezuela, unidades adquiridas para contingencias de 30 días con frecuencia permanecen "
        "energizadas durante 5 a 10 años en el mismo patio de tierra, alimentando de forma continua a poblaciones enteras.\n"
        "• Identificación Transparente: SIGAD no las oculta ni las disfraza de instalaciones convencionales. Las identifica con "
        "el atributo es_movil = true y les estampa en la cabecera la insignia violeta '⭐ [S/E MÓVIL] · 🚛 SUBESTACIÓN MÓVIL PERMANENTE'.\n"
        "• Características Físicas: Refleja su área reducida (150 m² a 300 m², correspondiente a la losa del tráiler) y autogenera "
        "un esqueleto monobloque compacto de 1 solo transformador de potencia, disyuntor híbrido en chasis y servicios auxiliares propios de 125 Vdc.\n"
        "• Cumplimiento ISO 55000: Permite monitorear el transformador sobre ruedas, su nivel de aceite dieléctrico y su historial de averías "
        "exactamente igual que a cualquier instalación fija del sistema de potencia."
    )
    p.paragraph_format.space_after = Pt(8)

    # --------------------------------------------------------------------------
    # 8. EL VISOR ATLAS TOPOLÓGICO SEN (UNIFILAR VIVO)
    # --------------------------------------------------------------------------
    h8 = doc.add_heading(level=1)
    r_h8 = h8.add_run("8. EL VISOR ATLAS TOPOLÓGICO SEN (UNIFILAR VIVO)")
    r_h8.font.color.rgb = NAVY
    r_h8.font.bold = True

    p = doc.add_paragraph(
        "El módulo Atlas Topológico CADAFE (AtlasTopologicoView.tsx) materializa el diagrama unifilar interactivo "
        "mediante código vectorial SVG de alta precisión:\n"
        "• Proyección Matemática Automatizada: Lee la estructura en tiempo real y dibuja la simbología normalizada (IEC 60617 / ANSI C37.2) "
        "con círculos entrelazados para transformadores, cuchillas para seccionadores y rectángulos con diagonales para disyuntores.\n"
        "• Semáforos Operativos en Tiempo Real: Los símbolos cambian dinámicamente según el estado en patio: "
        "Verde (Operativo), Rojo con pulso activo (Indisponible/Averiado) y Ámbar (Alerta de Aceite/SF6).\n"
        "• Interactividad Total: Al pulsar sobre cualquier símbolo del diagrama, se abre de inmediato la Ficha Técnica de Placa "
        "del activo para consultar o editar sus parámetros sin salir del unifilar."
    )
    p.paragraph_format.space_after = Pt(8)

    # --------------------------------------------------------------------------
    # 9. TRAZABILIDAD DEL CICLO DE VIDA Y CONTROL DE INDISPONIBILIDADES
    # --------------------------------------------------------------------------
    h9 = doc.add_heading(level=1)
    r_h9 = h9.add_run("9. TRAZABILIDAD DEL CICLO DE VIDA Y CONTROL DE INDISPONIBILIDADES")
    r_h9.font.color.rgb = NAVY
    r_h9.font.bold = True

    p = doc.add_paragraph(
        "Para erradicar definitivamente la incongruencia entre los reportes de averías y la reposición física de equipos en los censos de la GGPD, "
        "SIGAD implementa dos flujos de grado industrial:\n\n"
        "1. Declaración de Falla (FaultModal.tsx): Permite sellar la indisponibilidad de cualquier componente seleccionando entre las "
        "22 causas tipificadas de falla del SEN (fuga severa de aceite, pérdida de SF6, disparo de relé 87T, sobrecarga térmica, etc.), "
        "dejando constancia del autor y la fecha bajo norma ISO 27001.\n\n"
        "2. Restablecimiento y Sustitución de Activos (RestoreModal.tsx): Al restablecer el servicio, el sistema obliga al usuario a especificar:\n"
        "   • Modalidad A (Reparación en Sitio): El equipo fue intervenido y reenergizado conservando su serial de placa.\n"
        "   • Modalidad B (Sustitución por Activo Nuevo): El equipo quemado fue retirado y se energizó un reemplazo. "
        "El sistema exige ingresar el nuevo Serial Troquelado de Placa, la Marca y la Capacidad MVA.\n\n"
        "Resultado: El componente se actualiza automáticamente con su nueva identidad física, cerrando la avería y dejando en el libro "
        "inmutable la constancia histórica: 'Se desincorporó serial anterior X y se instaló nuevo activo serial Y'. Cero pérdidas de trazabilidad."
    )
    p.paragraph_format.space_after = Pt(8)

    # --------------------------------------------------------------------------
    # 10. ESTADO ACTUAL Y PLAN DE ACCIÓN PARA EL VIERNES
    # --------------------------------------------------------------------------
    h10 = doc.add_heading(level=1)
    r_h10 = h10.add_run("10. ESTADO ACTUAL Y PLAN PARA LA ENTREGA DEL VIERNES")
    r_h10.font.color.rgb = NAVY
    r_h10.font.bold = True

    p = doc.add_paragraph(
        "Al cierre de esta sesión de trabajo (06 de octubre de 2026), el proyecto SIGAD v1.0 se encuentra en el siguiente estado técnico:\n"
        "• Aplicación Construida: apps-refactorizadas/SIGAD-REF/ en puerto 3007 (React 18 + Vite 6 + Tailwind CSS).\n"
        "• Servidor Local Activo: Escuchando y respondiendo HTTP 200 en http://localhost:3007/.\n"
        "• Verificación de Compilación: 'tsc && vite build' compila al 100% limpio (código 0, 0 lints, 0 errores).\n"
        "• Catálogo Nacional Cargado: 871 Subestaciones y 4.207 Circuitos (Cero Mock, Repositorio GGPD).\n"
        "• Casos de Prueba Verificados: S/E BEJUMA (SE-CAR-0216, 7 circuitos de Carabobo) y S/E SAN CRISTÓBAL (SE-TAC-0685, 8 circuitos de Táchira).\n"
        "• Documentación Técnica Oficial: NAC_2026_GGPD_SIGAD_ARQUITECTURA_GESTION_ACTIVOS_V01.md y handoff.md actualizados."
    )
    p.paragraph_format.space_after = Pt(14)

    # FIRMAS
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(20)
    p_sig.paragraph_format.space_after = Pt(4)
    p_sig.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sig = p_sig.add_run(
        "_____________________________________________          _____________________________________________\n"
        "           Ing. Yván M. Cipiran N.                                   Consultoría Especializada SEN          \n"
        "        Líder de Automatización e IA                                 Sistemas Eléctricos de Potencia        \n"
        "                   GGPD                                                 Normas ISO 55000 / CADAFE           "
    )
    r_sig.font.name = 'Consolas'
    r_sig.font.size = Pt(8.5)
    r_sig.font.color.rgb = NAVY

    # Guardar en dos ubicaciones convenientes
    out_dir = r"c:\Users\innov\OneDrive\Documents\Repositorio_Maestro\docs"
    out_root = r"c:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
    
    file_name = "NAC_2026_GGPD_MEMO_TECNICO_SIGAD_ING_CARLOS_REYES_V01.docx"
    file_short = "MEMORANDO_TECNICO_SIGAD_ING_CARLOS_REYES.docx"
    
    path_docs = os.path.join(out_dir, file_name)
    path_root = os.path.join(out_root, file_short)

    doc.save(path_docs)
    doc.save(path_root)
    print(f"Documento DOCX generado exitosamente en:\n1. {path_docs}\n2. {path_root}")

if __name__ == '__main__':
    create_document()
