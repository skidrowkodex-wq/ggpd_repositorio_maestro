import json
from api import app


def dispatch(request, body=None):
    with app.app_context():
        if body is None and request.method in ('POST', 'PUT', 'PATCH') and request.body:
            try:
                body = json.loads(request.body)
            except (json.JSONDecodeError, TypeError):
                body = request.body
        with app.test_request_context(
            path=request.path,
            method=request.method,
            query_string=request.query_string.encode() if request.query_string else None,
            data=json.dumps(body) if isinstance(body, dict) else body,
            content_type='application/json',
            headers={k: v for k, v in request.headers.items()}
        ):
            response = app.full_dispatch_request()
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }