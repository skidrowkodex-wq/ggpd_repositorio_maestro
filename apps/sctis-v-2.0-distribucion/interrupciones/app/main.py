from app import create_app
from app.config import Config
import os

app = create_app()

@app.after_request
def add_cookie_attrs(response):
    from werkzeug.datastructures import Headers
    new_headers = Headers()
    for k, v in response.headers.items():
        if k.lower() == 'set-cookie':
            if 'Partitioned' not in v:
                v = f"{v}; Partitioned"
        new_headers.add(k, v)
    response.headers = new_headers
    return response

@app.route('/health')
def health():
    return {'status': 'ok', 'version': '1.0.0', 'env': Config.ENV}, 200

if __name__ == '__main__':
    port = Config.PORT
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)