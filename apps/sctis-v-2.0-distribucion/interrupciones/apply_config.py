import os
from dotenv import load_dotenv
load_dotenv('.env')

from app import create_app
from app.db import query
import sys

app = create_app()
with app.app_context():
    with open('migraciones/010_configuracion.sql', 'r') as f:
        sql = f.read()
    
    query(sql, fetch=False)
    print("Migration applied successfully")
