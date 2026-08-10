#!/usr/bin/env python3
from dotenv import load_dotenv
load_dotenv()

from app.main import app
from app.config import Config

if __name__ == '__main__':
    port = Config.PORT
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
