from flask import Blueprint, render_template, request, jsonify, g
from app.db import query, query_one
from app.auth import login_required, role_required
from datetime import datetime

bp = Blueprint('assets', __name__)

PROCESS_CODE = 'sctis_import'


def _nombre_canonico(nombre):
    return ' '.join(w.capitalize() for w in str(nombre).strip().split())


def _resolver_o_crear_subestacion(estado, nombre, voltage_kv, usuario):
    code = nombre.upper().strip()
    existente = query_one("""
        SELECT asset_id FROM common.assets
        WHERE asset_type = 'SUBSTATION' AND asset_code = %s AND state_code = %s AND is_active = true
    """, (code, estado))
    if existente:
        return existente['asset_id']
    res = query("""
        INSERT INTO common.assets
            (asset_type, asset_subtype, asset_code, asset_name, asset_name_normalizado,
             state_code, voltage_kv, classification, source_process, status, is_active,
             created_by, updated_by)
        VALUES ('SUBSTATION', 'DISTRIBUCION', %s, %s, %s, %s, %s,
                'INTERNO', %s, 'OPERATIVO', true, %s, %s)
        RETURNING asset_id
    """, (code, nombre, nombre, estado, voltage_kv, PROCESS_CODE, usuario, usuario))
    return res[0]['asset_id']


def _resolver_o_crear_circuito(estado, nombre, parent_asset_id, usuario):
    se = query_one("SELECT asset_code FROM common.assets WHERE asset_id = %s", (parent_asset_id,))
    if not se:
        return None
    code = f"{se['asset_code']} :: {nombre.upper().strip()}"
    existente = query_one("""
        SELECT asset_id FROM common.assets
        WHERE asset_type = 'CIRCUITO' AND parent_asset_id = %s AND asset_name = %s AND is_active = true
    """, (parent_asset_id, nombre))
    if existente:
        return existente['asset_id']
    res = query("""
        INSERT INTO common.assets
            (asset_type, asset_code, asset_name, asset_name_normalizado,
             state_code, parent_asset_id, elemento_tipo, classification,
             source_process, status, is_active, created_by, updated_by)
        VALUES ('CIRCUITO', %s, %s, %s, %s, %s, 'CTO',
                'INTERNO', %s, 'OPERATIVO', true, %s, %s)
        RETURNING asset_id
    """, (code, nombre, nombre, estado, parent_asset_id, PROCESS_CODE, usuario, usuario))
    return res[0]['asset_id']


def _guardar_alias(estado, asset_type, alias_nombre, se_referencia, asset_id, usuario):
    query("""
        INSERT INTO sctis.asset_alias
            (estado_codigo, asset_type, alias_nombre, se_referencia, asset_id, usuario)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (estado_codigo, asset_type, alias_nombre, se_referencia)
        DO UPDATE SET asset_id = EXCLUDED.asset_id, usuario = EXCLUDED.usuario,
                      updated_at = now()
    """, (estado, asset_type, alias_nombre, se_referencia, asset_id, usuario), fetch=False)


def _completar_tareas_agotadas(estado_codigo):
    pend = query_one("""
        SELECT count(*) AS n FROM sctis.asset_request
        WHERE estado_codigo = %s AND estado_request IN ('PENDIENTE', 'EN_REVISION')
    """, (estado_codigo,))
    if pend and pend['n'] == 0:
        query("""
            UPDATE sctis.tarea_pendiente
            SET estado_tarea = 'COMPLETADA', completed_at = now()
            WHERE tipo_tarea = 'APROBAR_ACTIVO' AND estado_tarea = 'PENDIENTE'
              AND estado_codigo = %s
        """, (estado_codigo,), fetch=False)


# ─── Página ───────────────────────────────────────────────────

@bp.route('/admin/activos')
@login_required
@role_required('admin')
def activos_page():
    estados = query("SELECT state_code, state_name FROM common.states ORDER BY state_name")
    return render_template('admin/activos.html', estados=estados)


# ─── Listado ──────────────────────────────────────────────────

@bp.route('/api/admin/activos')
@login_required
@role_required('admin')
def listar_activos():
    estado = request.args.get('estado')
    estado_request = request.args.get('estado_request')
    asset_type = request.args.get('asset_type')
    where = ["1=1"]
    params = []
    if estado:
        where.append("r.estado_codigo = %s")
        params.append(estado)
    if estado_request:
        where.append("r.estado_request = %s")
        params.append(estado_request)
    if asset_type:
        where.append("r.asset_type = %s")
        params.append(asset_type)
    where_clause = " AND ".join(where)
    rows = query(f"""
        SELECT r.request_id, r.estado_codigo, st.state_name,
               r.asset_type, r.nombre_reportado, r.nombre_normalizado,
               r.se_referencia, r.voltage_kv, r.filas_afectadas,
               r.clasificacion, r.sugerencia_alias,
               sa.asset_name AS sugerencia_nombre,
               r.estado_request, r.asset_creado_id,
               ca.asset_name AS creado_nombre,
               r.submission_id, r.requested_by, r.decided_by,
               r.decided_at, r.comentario, r.created_at,
               sr.nombre_reportado AS se_request_nombre
        FROM sctis.asset_request r
        JOIN common.states st ON st.state_code = r.estado_codigo
        LEFT JOIN common.assets sa ON sa.asset_id = r.sugerencia_alias
        LEFT JOIN common.assets ca ON ca.asset_id = r.asset_creado_id
        LEFT JOIN sctis.asset_request sr ON sr.request_id = r.se_request_id
        WHERE {where_clause}
        ORDER BY r.estado_request = 'PENDIENTE' DESC, r.created_at DESC
    """, params)
    return jsonify(rows)


# ─── Catálogo para la acción "asignar alias" ───────────────────

@bp.route('/api/admin/activos/catalogo')
@login_required
@role_required('admin')
def catalogo_activos():
    estado = request.args.get('estado')
    asset_type = request.args.get('tipo')
    if not estado or not asset_type:
        return jsonify({'error': 'Se requiere estado y tipo'}), 400
    if asset_type not in ('SUBSTATION', 'CIRCUITO'):
        return jsonify({'error': 'Tipo inválido'}), 400
    rows = query("""
        SELECT a.asset_id, COALESCE(a.asset_name_normalizado, a.asset_name) AS asset_name,
               a.asset_code, p.asset_name AS se_nombre
        FROM common.assets a
        LEFT JOIN common.assets p ON p.asset_id = a.parent_asset_id
        WHERE a.asset_type = %s AND a.state_code = %s AND a.is_active = true
        ORDER BY p.asset_name, a.asset_name
    """, (asset_type, estado))
    return jsonify(rows)


# ─── Aprobar: crea el activo y hace backfill ───────────────────

@bp.route('/api/admin/activos/<int:request_id>/aprobar', methods=['POST'])
@login_required
@role_required('admin')
def aprobar_activo(request_id):
    req = query_one("SELECT * FROM sctis.asset_request WHERE request_id = %s", (request_id,))
    if not req:
        return jsonify({'error': 'Solicitud no encontrada'}), 404
    if req['estado_request'] == 'APROBADO':
        return jsonify({'error': 'Ya aprobada'}), 400

    data = request.get_json() or {}
    nombre = _nombre_canonico(data.get('nombre_normalizado') or req['nombre_normalizado'] or req['nombre_reportado'])
    voltage = data.get('voltage_kv') or req['voltage_kv']
    usuario = g.user.get('username', 'admin')
    estado = req['estado_codigo']

    try:
        if req['asset_type'] == 'SUBSTATION':
            asset_id = _resolver_o_crear_subestacion(estado, nombre, voltage, usuario)
            query("""
                UPDATE sctis.tira_interrupcion
                SET subestacion_id = %s, subestacion = %s
                WHERE estado_codigo = %s AND subestacion = %s AND subestacion_id IS NULL
            """, (asset_id, nombre, estado, req['nombre_reportado']), fetch=False)
            _guardar_alias(estado, 'SUBSTATION', req['nombre_reportado'], '', asset_id, usuario)
        else:
            parent_id = None
            if req['se_request_id']:
                se_req = query_one(
                    "SELECT asset_creado_id FROM sctis.asset_request WHERE request_id = %s",
                    (req['se_request_id'],))
                parent_id = se_req['asset_creado_id'] if se_req else None
            if not parent_id:
                alias = query_one("""
                    SELECT asset_id FROM sctis.asset_alias
                    WHERE estado_codigo = %s AND asset_type = 'SUBSTATION' AND alias_nombre = %s
                """, (estado, req['se_referencia']))
                parent_id = alias['asset_id'] if alias else None
            if not parent_id:
                return jsonify({
                    'error': 'No se puede resolver la SE padre. Apruebe primero la SE asociada '
                             'o asígnele un alias.'
                }), 400
            asset_id = _resolver_o_crear_circuito(estado, nombre, parent_id, usuario)
            if not asset_id:
                return jsonify({'error': 'No se encontró la SE padre en el catálogo'}), 400
            query("""
                UPDATE sctis.tira_interrupcion
                SET circuito_id = %s, circuito = %s
                WHERE estado_codigo = %s AND circuito = %s AND subestacion = %s
                  AND circuito_id IS NULL
            """, (asset_id, nombre, estado, req['nombre_reportado'], req['se_referencia']), fetch=False)
            _guardar_alias(estado, 'CIRCUITO', req['nombre_reportado'], req['se_referencia'], asset_id, usuario)

        query("""
            UPDATE sctis.asset_request
            SET estado_request = 'APROBADO', asset_creado_id = %s, nombre_normalizado = %s,
                decided_by = %s, decided_at = now()
            WHERE request_id = %s
        """, (asset_id, nombre, usuario, request_id), fetch=False)
        _completar_tareas_agotadas(estado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'ok': True, 'asset_id': asset_id, 'asset_name': nombre})


# ─── Asignar alias: refiere a un activo existente ──────────────

@bp.route('/api/admin/activos/<int:request_id>/alias', methods=['POST'])
@login_required
@role_required('admin')
def asignar_alias(request_id):
    req = query_one("SELECT * FROM sctis.asset_request WHERE request_id = %s", (request_id,))
    if not req:
        return jsonify({'error': 'Solicitud no encontrada'}), 404
    data = request.get_json() or {}
    asset_id = data.get('asset_id')
    if not asset_id:
        return jsonify({'error': 'Debe seleccionar el activo de referencia'}), 400

    asset = query_one("""
        SELECT asset_id, asset_type, COALESCE(asset_name_normalizado, asset_name) AS asset_name
        FROM common.assets WHERE asset_id = %s
    """, (asset_id,))
    if not asset:
        return jsonify({'error': 'Activo de referencia no encontrado'}), 404
    if asset['asset_type'] != req['asset_type']:
        return jsonify({'error': 'El activo de referencia debe ser del mismo tipo'}), 400

    usuario = g.user.get('username', 'admin')
    estado = req['estado_codigo']
    try:
        if req['asset_type'] == 'SUBSTATION':
            _guardar_alias(estado, 'SUBSTATION', req['nombre_reportado'], '', asset_id, usuario)
            query("""
                UPDATE sctis.tira_interrupcion
                SET subestacion_id = %s, subestacion = %s
                WHERE estado_codigo = %s AND subestacion = %s AND subestacion_id IS NULL
            """, (asset_id, asset['asset_name'], estado, req['nombre_reportado']), fetch=False)
        else:
            _guardar_alias(estado, 'CIRCUITO', req['nombre_reportado'], req['se_referencia'], asset_id, usuario)
            query("""
                UPDATE sctis.tira_interrupcion
                SET circuito_id = %s, circuito = %s
                WHERE estado_codigo = %s AND circuito = %s AND subestacion = %s
                  AND circuito_id IS NULL
            """, (asset_id, asset['asset_name'], estado, req['nombre_reportado'], req['se_referencia']), fetch=False)

        query("""
            UPDATE sctis.asset_request
            SET estado_request = 'ES_ALIAS', asset_creado_id = %s,
                decided_by = %s, decided_at = now()
            WHERE request_id = %s
        """, (asset_id, usuario, request_id), fetch=False)
        _completar_tareas_agotadas(estado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'ok': True, 'asset_id': asset_id})


# ─── Rechazar ──────────────────────────────────────────────────

@bp.route('/api/admin/activos/<int:request_id>/rechazar', methods=['POST'])
@login_required
@role_required('admin')
def rechazar_activo(request_id):
    req = query_one("SELECT * FROM sctis.asset_request WHERE request_id = %s", (request_id,))
    if not req:
        return jsonify({'error': 'Solicitud no encontrada'}), 404
    data = request.get_json() or {}
    usuario = g.user.get('username', 'admin')
    try:
        query("""
            UPDATE sctis.asset_request
            SET estado_request = 'RECHAZADO', comentario = %s,
                decided_by = %s, decided_at = now()
            WHERE request_id = %s
        """, (data.get('comentario', ''), usuario, request_id), fetch=False)
        _completar_tareas_agotadas(req['estado_codigo'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'ok': True})


# ─── Corregir nombre sugerido ──────────────────────────────────

@bp.route('/api/admin/activos/<int:request_id>/corregir', methods=['POST'])
@login_required
@role_required('admin')
def corregir_activo(request_id):
    req = query_one("SELECT * FROM sctis.asset_request WHERE request_id = %s", (request_id,))
    if not req:
        return jsonify({'error': 'Solicitud no encontrada'}), 404
    data = request.get_json() or {}
    nombre = _nombre_canonico(data.get('nombre_normalizado') or req['nombre_normalizado'])
    if not nombre:
        return jsonify({'error': 'Nombre requerido'}), 400
    try:
        query("""
            UPDATE sctis.asset_request
            SET nombre_normalizado = %s, estado_request = 'EN_REVISION', updated_at = now()
            WHERE request_id = %s
        """, (nombre, request_id), fetch=False)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'ok': True, 'nombre_normalizado': nombre})
