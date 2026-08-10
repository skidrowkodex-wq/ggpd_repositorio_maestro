from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, g
from app.db import query, query_one
from werkzeug.security import check_password_hash
from functools import wraps
from datetime import datetime

bp = Blueprint('auth', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json:
                return jsonify({'error': 'No autorizado'}), 401
            return redirect(url_for('auth.login_page'))
        g.user = session['user']
        g.role = session['role']
        g.user_estado = session.get('user_estado')
        g.is_admin = session.get('role_code') == 'admin'
        return f(*args, **kwargs)
    return decorated


def user_estado_filter():
    """Retorna (clausula_where, parametros) para filtrar por estado del usuario."""
    if hasattr(g, 'is_admin') and g.is_admin:
        return '', []
    estado = getattr(g, 'user_estado', None)
    if estado:
        return 'ti.estado_codigo = %s', [estado]
    return '', []


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                if request.is_json:
                    return jsonify({'error': 'No autorizado'}), 401
                return redirect(url_for('auth.login_page'))
            if session.get('role_code') not in roles:
                if request.is_json:
                    return jsonify({'error': 'Permiso denegado'}), 403
                return redirect(url_for('auth.login_page'))
            g.user = session['user']
            g.role = session['role']
            return f(*args, **kwargs)
        return decorated
    return decorator


@bp.route('/login', methods=['GET'])
def login_page():
    if 'user_id' in session:
        return redirect(url_for('main.index'))
    return render_template('login.html')


@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contrase\xf1a requeridos'}), 400

    username = data['username'].strip()
    password = data['password']

    user = query_one("""
        SELECT u.*, r.role_code, r.role_name
        FROM sctis.user_profiles u
        JOIN sctis.user_roles r ON r.role_id = u.role_id
        WHERE u.username = %s
    """, (username,))

    if not user:
        return jsonify({'error': 'Usuario o contrase\xf1a incorrectos'}), 401

    if not user['is_active']:
        return jsonify({'error': 'Cuenta desactivada'}), 403

    if user.get('locked_until'):
        locked_time = user['locked_until']
        if isinstance(locked_time, str):
            try:
                locked_time = datetime.fromisoformat(locked_time)
            except Exception:
                locked_time = None
        if locked_time and locked_time > datetime.utcnow():
            remaining = max(1, (locked_time - datetime.utcnow()).seconds // 60)
            return jsonify({'error': f'Cuenta bloqueada. Intente en {remaining} minutos'}), 423

    if not check_password_hash(user['password_hash'], password):
        query("UPDATE sctis.user_profiles SET failed_attempts = failed_attempts + 1 WHERE user_id = %s",
              (user['user_id'],), fetch=False)
        return jsonify({'error': 'Usuario o contrase\xf1a incorrectos'}), 401

    query("""
        UPDATE sctis.user_profiles
        SET last_login = NOW(), failed_attempts = 0, locked_until = NULL
        WHERE user_id = %s
    """, (user['user_id'],), fetch=False)

    session['user_id'] = user['user_id']
    session['user'] = {
        'user_id': user['user_id'],
        'username': user['username'],
        'full_name': user['full_name'],
        'role_id': user['role_id'],
        'role_code': user['role_code'],
        'role_name': user['role_name'],
        'estado_codigo': user['estado_codigo'],
        'estado_nombre': user.get('estado_nombre'),
    }
    session['role'] = user['role_name']
    session['role_code'] = user['role_code']
    session['user_estado'] = user['estado_codigo']
    session.permanent = True

    query("""
        INSERT INTO audit.access_log (username, schema_name, table_name, operation, row_count, result, notes)
        VALUES (%s, 'sctis', 'user_profiles', 'SELECT', 1, 'success', %s)
    """, (username, f'Login desde {request.remote_addr}'), fetch=False)

    return jsonify({
        'ok': True,
        'user': {
            'username': user['username'],
            'full_name': user['full_name'],
            'role': user['role_name'],
        }
    })


@bp.route('/api/login/firebase', methods=['POST'])
def login_firebase():
    data = request.get_json()
    if not data or not data.get('id_token'):
        return jsonify({'error': 'Token requerido'}), 400

    from app.firebase_auth import verify_firebase_token
    result = verify_firebase_token(data['id_token'])
    if 'error' in result:
        return jsonify({'error': result['error']}), 401

    uid = result['uid']
    email = result.get('email', '')

    user = query_one("""
        SELECT u.*, r.role_code, r.role_name
        FROM sctis.user_profiles u
        JOIN sctis.user_roles r ON r.role_id = u.role_id
        WHERE u.firebase_uid = %s OR u.username = %s
    """, (uid, email))

    if not user:
        return jsonify({'error': 'Usuario no registrado'}), 401

    if not user['is_active']:
        return jsonify({'error': 'Cuenta desactivada'}), 403

    session['user_id'] = user['user_id']
    session['user'] = {
        'user_id': user['user_id'],
        'username': user['username'],
        'full_name': user['full_name'],
        'role_id': user['role_id'],
        'role_code': user['role_code'],
        'role_name': user['role_name'],
        'estado_codigo': user['estado_codigo'],
        'estado_nombre': user.get('estado_nombre'),
    }
    session['role'] = user['role_name']
    session['role_code'] = user['role_code']
    session['user_estado'] = user['estado_codigo']
    session.permanent = True

    query("""
        INSERT INTO audit.access_log (username, schema_name, table_name, operation, row_count, result, notes)
        VALUES (%s, 'sctis', 'user_profiles', 'SELECT', 1, 'success', %s)
    """, (user['username'], f'Firebase login UID={uid}'), fetch=False)

    return jsonify({
        'ok': True,
        'user': {
            'username': user['username'],
            'full_name': user['full_name'],
            'role': user['role_name'],
        }
    })


@bp.route('/api/logout', methods=['POST'])
def logout():
    username = session.get('user', {}).get('username', 'unknown')
    session.clear()
    query("""
        INSERT INTO audit.access_log (username, schema_name, table_name, operation, row_count, result, notes)
        VALUES (%s, 'sctis', 'user_profiles', 'SELECT', 1, 'success', 'Logout voluntario')
    """, (username,), fetch=False)
    return jsonify({'ok': True})


@bp.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    return jsonify(session['user'])
