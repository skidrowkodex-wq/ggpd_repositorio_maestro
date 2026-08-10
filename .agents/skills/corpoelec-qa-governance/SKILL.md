---
name: corpoelec-qa-governance
description: "Use when performing QA, technical audit, data governance, ISO compliance (8000, 9000, 27001, 55000), ISACA COBIT 2019 assessment, or database unification for CORPOELEC applications in the Repositorio Maestro."
metadata:
  author: CORPOELEC GGPD / DeepMind Team
  version: "1.0.0"
---

# CORPOELEC GGPD — QA Audit, Governance & Data Unification Skill

## Core Principles & Scope

This skill documents the mandatory engineering, data science, ISO standards, and ISACA COBIT audit procedures for evaluating, hardening, and unifying applications within the **Repositorio Maestro de Distribución (`/apps`)**.

Target Goal: Achieve **Industrial-Grade Software Engineering**, robust database-level governance, 100% ISO compliance, and seamless unification of federal data across all 24 entities.

---

## 1. INSTITUTIONAL DOCUMENT CODING STANDARD (`GGPD-SGM-INS-005 v3.0 ISO`)

All document names, reports, manuals, and data files generated within the GGPD MUST strictly adhere to the following logic and variable ordering using underscores (`_`) as separators:

$$\mathbf{[GEOGRAF\text{Í}A]\_[A\text{Ñ}O]\_[C\text{Ó}DIGO-PROCESO]\_[ACTIVIDAD]\_[VERSI\text{Ó}N].[EXTENSI\text{Ó}N]}$$

### Authorized Geographical Identifiers (`[GEOGRAFÍA]`):
* **NAC**: Consolidado Nacional (República Bolivariana de Venezuela)
* **AMA** (Amazonas), **ANZ** (Anzoátegui), **APU** (Apure), **ARA** (Aragua), **BAR** (Barinas), **BOL** (Bolívar), **CAR** (Carabobo), **COJ** (Cojedes), **DEL** (Delta Amacuro), **DCA** (Distrito Capital), **FAL** (Falcón), **GUA** (Guárico), **LGU** (La Guaira), **LAR** (Lara), **MER** (Mérida), **MIR** (Miranda), **MON** (Monagas), **NES** (Nueva Esparta), **POR** (Portuguesa), **SUC** (Sucre), **TAC** (Táchira), **TRU** (Trujillo), **YAR** (Yaracuy), **ZUL** (Zulia), **GEQ** (Guayana Esequiba).

### Rule Parameters:
1. `[GEOGRAFÍA]`: Mandatory 3-letter prefix leading the filename.
2. `[AÑO]`: 4-digit fiscal year (e.g., `2026`).
3. `[CÓDIGO-PROCESO]`: Immutable acronym `GGPD`.
4. `[ACTIVIDAD]`: Uppercase activity descriptor without accents, special characters, or spaces (e.g., `AUDITORIA_TECNICA_GOBERNANZA_BD`).
5. `[VERSIÓN]`: Incremental version tag (e.g., `V01`, `V02`).

---

## 2. MULTIDISCIPLINARY QA AUDIT FRAMEWORK

Every incoming application in `/apps` MUST be evaluated under the following 4 pillars:

### A. Electrical Engineering & Substation/Network Maintenance
* **Asset Hierarchy**: Validate levels of tension from High Voltage (**765 kV, 400 kV, 230 kV, 115 kV**) down to Distribution (**34.5 kV, 13.8 kV, BT**).
* **IEC 81346-10 (RDS-PS)**: Ensure Substation (SE) and Circuit (CT) codes follow:  
  `=VE+<ESTADO>-<NOMBRE_ACTIVO>`
* **Equipment Criticality**: Model Patio Elements accurately (Power Transformers, OLTC, $SF_6$ Circuit Breakers, Disconnectors, Surge Arresters, CT/PT Instrument Transformers).
* **Failure Taxonomy**: Map interruption causes against the Official 22 Causes and 14 Sub-causes catalog.

### B. Data Science & Pipeline Architecture
* **High-Performance Ingestion**: Use streaming/read-only wrappers (e.g., `HojaMemoria` pattern) for fast Excel processing.
* **Semantic Deduplication**: Generate SHA-256 cryptographic fingerprints (`generateEquipmentFingerprint`) using `State|Substation|Voltage|Component|Nomenclature`.
* **Fuzzy Asset Resolution**: Use string similarity (`difflib` / SQL trigrams) to resolve non-standard asset names into `sctis.asset_alias` for ISO 8000-110 automated learning:
  * Ratio $\ge 0.85$: Typo correction.
  * Ratio $\ge 0.60$: Candidate Alias.
  * Ratio $< 0.60$: Potential New Asset request (`sctis.asset_request`).

### C. ISO Standards Compliance
* **ISO 55000 / 55001 (Asset Management)**: Asset life cycle traceability, condition-based maintenance.
* **ISO 8000 (Data Quality)**: Database triggers (`trg_tira_quality`) for scoring (0–100), Quarantine & Remediation drawers for syntax errors.
* **ISO 9001:2015 (Process Quality)**: Separation between raw ingestion and catalog governance.
* **ISO/IEC 27001:2022 (Information Security)**: Row-Level Security (RLS) in PostgreSQL/Supabase, PBKDF2/SHA-512 password hashing, immutable audit logs (`audit.logs`, `samc_audit_log`).

### D. ISACA COBIT 2019 & Financial Governance
* **Preventive Database Controls**: Never rely on frontend-only validation. Enforce budget ceilings, invoice validation, and fund origin via PL/pgSQL triggers (`BEFORE INSERT OR UPDATE`).
* **Segregation of Duties (SoD)**: Strict role separation between field analyst (`ANALISTA`), approving supervisor (`ADMIN`), and auditor (`AUDITOR`).
* **Auditability**: Full 360° reconciliation views (`v_conciliacion_presupuestaria`, `v_resumen_conciliacion`).

---

## 3. DATABASE LEVEL GOVERNANCE PATTERNS

When building or auditing PostgreSQL/Supabase schemas for CORPOELEC:

1. **Preventive Budget Trigger Pattern**:
```sql
CREATE OR REPLACE FUNCTION fn_validar_presupuesto_viatico()
RETURNS TRIGGER AS $$
DECLARE
    v_costo_total DECIMAL(15,2);
    v_total_asignado DECIMAL(15,2);
    v_saldo_disponible DECIMAL(15,2);
BEGIN
    SELECT costo_total INTO v_costo_total FROM viatico WHERE id = NEW.viatico_id;
    SELECT COALESCE(SUM(monto_asignado), 0) INTO v_total_asignado
    FROM asignacion_viatico
    WHERE viatico_id = NEW.viatico_id AND activo = TRUE AND estado NOT IN ('ANULADO', 'RECHAZADO')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    v_saldo_disponible := v_costo_total - v_total_asignado;
    
    IF NEW.monto_asignado > v_saldo_disponible THEN
        RAISE EXCEPTION 'PRESUPUESTO EXCEDIDO [COBIT MEA02]: El monto solicitado (Bs. %) excede el disponible (Bs. %)',
            NEW.monto_asignado, v_saldo_disponible;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

2. **Invoice Validation Trigger Pattern**:
   * Enforce that spent amounts in closure procedures match the exact sum of validated receipts (`comprobante_viatico.estado = 'VALIDADO'`) with zero pending items.

---

## 4. DUAL DOCUMENTATION GENERATION WORKFLOW

For every major audit or feature delivery, generate TWO corresponding reports:

1. **Technical Report** (`NAC_[YEAR]_GGPD_AUDITORIA_TECNICA_[NAME]_V01.md`):
   * Detailed DDL scripts, PL/pgSQL trigger code, ER diagrams, schema specifications, and ISO/COBIT compliance matrices.
2. **Functional & Executive Report** (`NAC_[YEAR]_GGPD_AUDITORIA_FUNCIONAL_[NAME]_V01.md`):
   * Accessible, non-jargon language for executive decision-makers, plain explanations of ISO/COBIT benefits, RACI matrix, and justification for AI/cloud resource funding.

### Mandatory Format Conversions:
Always convert both markdown reports into formatted **`.docx`** and **`.doc`** Word documents using Python script automation (`python-docx`), applying CORPOELEC Navy (`#003366`) headers, styled tables, code block callouts, and clean margins for Microsoft Word and Google Docs compatibility.

---

## 5. COMMITMENT TO INDUSTRIAL-GRADE APPLICATIONS

All applications incorporated into the Repositorio Maestro must reach **Industrial-Grade Reliability**:
* Zero mock/placeholder code in production paths.
* Active security headers (OWASP, rate limiting, CORS) on Express/Node/Python servers.
* Full test coverage for critical business logic (ETL parsers, triggers, auth flows).
* Clean separation of concerns between shared assets (`common.assets` / `activos_red`) and app-specific domains.
