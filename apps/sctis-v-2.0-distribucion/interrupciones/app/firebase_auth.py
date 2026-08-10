import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from flask import current_app, g, session
import os


def get_firebase_app():
    if 'firebase_app' not in g:
        project_id = current_app.config.get('FIREBASE_PROJECT_ID')
        client_email = current_app.config.get('FIREBASE_CLIENT_EMAIL')
        private_key = current_app.config.get('FIREBASE_PRIVATE_KEY', '')

        if not project_id:
            return None

        if not firebase_admin._apps:
            cred_dict = {
                'type': 'service_account',
                'project_id': project_id,
                'client_email': client_email,
                'private_key': private_key.replace('\\n', '\n') if private_key else '',
            }
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {
                'projectId': project_id,
            })
        return firebase_admin.get_app()
    return g.firebase_app


def verify_firebase_token(id_token: str) -> dict:
    try:
        app = get_firebase_app()
        if app is None:
            return {'error': 'Firebase not configured'}
        decoded = firebase_auth.verify_id_token(id_token, app=app)
        return {'success': True, 'uid': decoded['uid'], 'email': decoded.get('email', '')}
    except Exception as e:
        return {'error': str(e)}


def get_firebase_user(uid: str) -> dict:
    try:
        app = get_firebase_app()
        if app is None:
            return {'error': 'Firebase not configured'}
        user = firebase_auth.get_user(uid, app=app)
        return {
            'success': True,
            'uid': user.uid,
            'email': user.email,
            'display_name': user.display_name,
            'disabled': user.disabled,
        }
    except Exception as e:
        return {'error': str(e)}