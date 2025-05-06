# backend/Dockerfile

# Basierend auf einem offiziellen Python-Image
# Wähle eine passende Version, z.B. 3.10 oder 3.11
# Die "-slim" Variante ist kleiner
FROM python:3.12-slim

# Setze Umgebungsvariablen
# Verhindert .pyc Dateien
ENV PYTHONDONTWRITEBYTECODE 1
# Sorgt dafür, dass Logs direkt ausgegeben werden
ENV PYTHONUNBUFFERED 1

# Systemabhängigkeiten installieren (Beispiel: postgresql-client für psycopg2)
# Füge ggf. weitere hinzu, z.B. build-essential, libgdal-dev falls nötig für Geo-Bibliotheken
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere nur die requirements-Datei und installiere Abhängigkeiten zuerst
# Dies nutzt Docker's Caching: Wenn requirements.txt sich nicht ändert, wird dieser Schritt übersprungen
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere den gesamten restlichen Code des Backends in das Arbeitsverzeichnis
# Stelle sicher, dass eine .dockerignore Datei im backend/ Verzeichnis existiert,
# um unnötige Dateien (z.B. venv, __pycache__) auszuschließen.
COPY . .

# Port, den die Anwendung im Container bereitstellt (z.B. 5000 für Flask, 8000 für Django)
EXPOSE 5000

# Standard-Befehl zum Starten der Anwendung (Beispiel für Flask)
# Stelle sicher, dass der Host auf 0.0.0.0 gesetzt ist, damit er von außerhalb des Containers erreichbar ist
# Passe den Befehl für Django an (z.B. ["python", "manage.py", "runserver", "0.0.0.0:8000"])
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]