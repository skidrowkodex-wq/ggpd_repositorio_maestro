import json
from api import app
from werkzeug.test import EnvironBuilder


def handler(request):
    path = request.path or '/'
    method = request.method or 'GET'
    query = request.query or {}
    body = request.body or b''
    headers = {k: v for k, v in request.headers.items()} if request.headers else {}

    if isinstance(query, dict):
        qs = '&'.join(f'{k}={v}' for k, v in query.items())
    else:
        qs = str(query) or ''

    builder = EnvironBuilder(
        path=path,
        method=method,
        query_string=qs.encode() if qs else b'',
        data=body,
        content_type=headers.get('Content-Type', 'application/json'),
        headers=headers,
    )
    env = builder.get_environ()

    with app.app_context():
        with app.request_context(env):
            try:
                response = app.full_dispatch_request()
                return {
                    'statusCode': response.status_code,
                    'headers': dict(response.headers),
                    'body': response.get_data(as_text=True),
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': str(e)}),
                }