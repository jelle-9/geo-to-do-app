# backend/app.py
import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv() # Lädt Variablen aus .env

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')
# Hier später DB-Konfiguration hinzufügen

@app.route('/')
def hello():
    db_url = os.environ.get('DATABASE_URL')
    return f"Hello from Backend! DB URL starts with: {db_url[:25]}..." if db_url else "Hello from Backend! DB URL not set."

# Kein app.run() hier, da Flask CLI oder Gunicorn das übernimmt
# Falls FLASK_APP in .env auf app:app gesetzt ist, sollte das reichen.
# Wenn du 'python app.py' als CMD hättest, bräuchtest du:
# if __name__ == '__main__':
#    app.run(host='0.0.0.0', port=5000, debug=True)