#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.main import app
from app.config import Config

if __name__ == '__main__':
    port = Config.PORT
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
