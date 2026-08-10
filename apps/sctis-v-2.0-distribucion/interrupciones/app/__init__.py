from flask import Flask
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    from app.db import close_db
    app.teardown_appcontext(close_db)

    from app.routes import bp
    app.register_blueprint(bp)
    from app.import_routes import bp as import_bp
    app.register_blueprint(import_bp)
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp)
    from app.admin_routes import bp as admin_bp
    app.register_blueprint(admin_bp)
    from app.asset_routes import bp as asset_bp
    app.register_blueprint(asset_bp)

    return app
