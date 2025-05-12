# backend/app/__init__.py

import os
from flask import Flask, jsonify # jsonify hinzugefügt für die Test-Route
from flask_sqlalchemy import SQLAlchemy

from flask_migrate import Migrate
#from flask_cors import CORS
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus der .env-Datei im backend-Verzeichnis
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Im Docker-Kontext werden Umgebungsvariablen oft direkt von Docker Compose gesetzt,
    # daher ist ein Fehlen der .env-Datei hier nicht unbedingt kritisch, wenn Docker Compose genutzt wird.
    print(f"Hinweis: .env Datei nicht gefunden unter {dotenv_path}. Umgebungsvariablen werden ggf. von Docker Compose erwartet.")

# Erstelle Instanzen der Erweiterungen global
db = SQLAlchemy()

migrate = Migrate()
#cors = CORS()

def create_app(config_name=None):
    """
    Application Factory: Erstellt und konfiguriert die Flask-Anwendungsinstanz.
    """
    app = Flask(__name__)

    # --- Konfiguration laden ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    if not app.config['SQLALCHEMY_DATABASE_URI']:
        print("WARNUNG: DATABASE_URL Umgebungsvariable ist nicht gesetzt. SQLAlchemy wird nicht korrekt funktionieren.")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'temporaerer_dev_secret_key_fuer_den_anfang')


    # --- Erweiterungen mit der App initialisieren ---
    db.init_app(app)

    migrate.init_app(app, db)
    # cors.init_app(app, resources={r"/api/*": {"origins": "*"}}) # Behalten wir für später, wenn /api genutzt wird

    # --- Blueprints registrieren ---
    # Vorerst auskommentiert, da die entsprechenden Dateien/Blueprints noch nicht existieren:
    # print("INFO: Blueprint-Importe und -Registrierungen sind momentan auskommentiert.")
    # from .api.tasks import tasks_bp
    # app.register_blueprint(tasks_bp, url_prefix='/api')

    # from .main_routes import main_bp
    # app.register_blueprint(main_bp)

    # --- Datenbankmodelle bekannt machen ---
    # Vorerst auskommentiert, da app/models.py noch nicht existiert oder die Modelle noch nicht definiert sind:
    # print("INFO: Modell-Import ist momentan auskommentiert.")
    with app.app_context():
        from . import models

    # +++ Eine einfache Test-Route direkt hier, um zu sehen, ob die App startet +++
    @app.route('/ping')
    def ping():
        return jsonify(message="Pong! Die Flask App (Factory) läuft!"), 200

    @app.route('/')
    def hello_world_root():
        # Die ursprüngliche Route, die du hattest, können wir hier als Test belassen
        db_url = os.environ.get('DATABASE_URL')
        message = f"Hello from Backend! DB URL is set: {db_url is not None}"
        return jsonify(message=message)

    return app