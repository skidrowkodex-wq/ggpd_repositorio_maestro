import os
from dotenv import load_dotenv

# Try to load .env file if it exists, prioritizing the root .env or interrupciones/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('APP_SECRET', 'sctis-secret-key')
    ENV = os.getenv('APP_ENV', 'development')
    DEBUG = os.getenv('APP_DEBUG', 'false').lower() == 'true'
    PORT = int(os.getenv('PORT', os.getenv('APP_PORT', '5000')))
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', '5432'))
    DB_NAME = os.getenv('DB_NAME', 'ggpd_se_cto_v1')
    DB_USER = os.getenv('DB_USER', 'fullstack001')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Lunes35.')
    DB_SCHEMA = os.getenv('DB_SCHEMA', 'sctis')
    DB_SSLMODE = os.getenv('DB_SSLMODE', 'prefer')

    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', '')
    FIREBASE_CLIENT_EMAIL = os.getenv('FIREBASE_CLIENT_EMAIL', '')
    FIREBASE_PRIVATE_KEY = os.getenv('FIREBASE_PRIVATE_KEY', '')

    REGION = os.getenv('REGION', 'us-central1')

    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_PARTITIONED = True

    @staticmethod
    def db_dsn():
        return (
            f"host={Config.DB_HOST} "
            f"port={Config.DB_PORT} "
            f"dbname={Config.DB_NAME} "
            f"user={Config.DB_USER} "
            f"password={Config.DB_PASSWORD} "
            f"sslmode={Config.DB_SSLMODE}"
        )

    @staticmethod
    def is_cloud_run():
        return os.getenv('K_SERVICE') is not None or os.getenv('GAE_ENV') == 'standard'