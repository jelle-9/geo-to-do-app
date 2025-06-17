# Geo To-Do App

Eine voll funktionsfähige, Geo-basierte Aufgabenverwaltungsanwendung. Dieses Projekt dient als Lern- und Demonstrationsprojekt für einen modernen Full-Stack-Ansatz mit Ionic/Angular im Frontend und einem Python/Flask-Backend, betrieben in einer containerisierten Docker-Umgebung mit PostGIS für räumliche Daten.

## Features

- **CRUD-Operationen für Aufgaben:** Erstellen, Lesen, Aktualisieren und Löschen von Aufgaben.
- **Geo-Referenzierung:** Jede Aufgabe kann optional mit einem geographischen Standort (Latitude/Longitude) verknüpft werden.
- **Interaktive Kartenauswahl:** Standorte können über eine interaktive Leaflet-Karte ausgewählt werden.
- **Kartenanzeige:** Aufgaben mit Standorten werden mit einer kleinen Kartenansicht in der Aufgabenliste dargestellt.
- **Geokodierung (Umschaltbar):**
    - **Lokal:** Adresssuche und Koordinatenumwandlung über eine selbstgehostete Nominatim-Instanz (mit Daten für Berlin).
    - **Remote:** Umschaltbare Nutzung der öffentlichen Nominatim API (OpenStreetMap) für weltweite Anfragen.
- **Containerisierte Umgebung:** Das gesamte Projekt (Frontend, Backend, Datenbanken) ist mit Docker und Docker Compose vollständig containerisiert für eine einfache Einrichtung und konsistente Entwicklungsumgebung.

## Technologie-Stack

| Bereich                | Technologie                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| **Frontend** | Ionic, Angular, TypeScript, SCSS, Leaflet, ngx-leaflet, Cordova/Capacitor |
| **Backend** | Python, Flask, SQLAlchemy, GeoAlchemy2, Flask-Migrate, Flask-CORS           |
| **App-Datenbank** | PostgreSQL + PostGIS Extension                                                     |
| **Geokodierung** | Nominatim (selbstgehostet & öffentlich)                                            |
| **Containerisierung** | Docker, Docker Compose                                                             |

## Projektstruktur

```
geo-to-do-app/
├── backend/                # Flask Backend-Service
│   ├── app/                # Das Flask Application Package
│   │   ├── __init__.py     # Application Factory (create_app)
│   │   ├── models.py       # SQLAlchemy & GeoAlchemy2 Modelle
│   │   └── api/            # API Blueprints (z.B. tasks.py)
│   ├── migrations/         # Flask-Migrate/Alembic Migrations-Verzeichnis
│   ├── .env.example        # Vorlage für die .env-Datei
│   ├── requirements.txt    # Python-Abhängigkeiten
│   └── Dockerfile          # Dockerfile für das Backend
├── frontend/               # Ionic/Angular Frontend-Anwendung
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/     # TypeScript Interfaces
│   │   │   ├── services/   # Angular Services (TaskService, GeocodingService)
│   │   │   └── tabs/       # Einzelne Tab-Seiten (Tab1, Tab2, etc.)
│   ├── angular.json
│   ├── package.json        # Node.js-Abhängigkeiten
│   └── Dockerfile          # Dockerfile für das Frontend
├── osm_data/               # Verzeichnis für lokale OSM-Daten (z.B. berlin-latest.osm.pbf)
└── docker-compose.yml      # Definiert und verbindet alle Services
```

## Erste Schritte

### Voraussetzungen

- Docker & Docker Compose V2 (Befehl `docker compose`)
- Für Windows-Benutzer: **WSL2 (Windows Subsystem for Linux)** ist erforderlich. Das Projekt **muss** in das WSL2-Dateisystem geklont werden (z.B. nach `/home/<dein-name>/projects/`), nicht auf ein Windows-Laufwerk (`/mnt/c/...`), um Live-Reload und Dateiberechtigungen korrekt zu handhaben.
- Git
- Ein Code-Editor wie VS Code mit der empfohlenen **WSL-Extension**.

### Installation und Setup

1.  **Repository klonen:**
    Öffne ein WSL-Terminal, navigiere zu deinem Projektverzeichnis und klone das Repository.
    ```bash
    # Im WSL-Terminal
    cd ~/projects
    git clone <url-deines-github-repos> geo-to-do-app
    cd geo-to-do-app
    ```

2.  **Backend-Umgebungsvariablen konfigurieren:**
    Im `backend/`-Verzeichnis wird eine `.env`-Datei benötigt. Erstelle sie aus der Vorlage:
    ```bash
    cp backend/.env.example backend/.env
    ```
    Öffne `backend/.env` und passe die Werte bei Bedarf an (z.B. `SECRET_KEY`). Die Standardwerte sollten für die lokale Docker-Entwicklung funktionieren.

3.  **OSM-Daten für lokales Nominatim herunterladen:**
    - Erstelle das Verzeichnis `osm_data` im Projekt-Root: `mkdir osm_data`.
    - Gehe zum [Geofabrik Download Server für Berlin](https://download.geofabrik.de/europe/germany/berlin.html).
    - Lade die Datei `berlin-latest.osm.pbf` herunter und speichere sie im `osm_data`-Ordner.

4.  **Docker-Container starten:**
    Dieser Befehl baut die Images (falls noch nicht geschehen) und startet alle vier Container (Frontend, Backend, App-DB, Nominatim-DB).
    ```bash
    # Aus dem Projekt-Root-Verzeichnis ausführen
    docker compose up --build
    ```
    **WICHTIG:** Der allererste Start wird **sehr lange dauern** (möglicherweise 30+ Minuten), da der `nominatim`-Container die OSM-Daten für Berlin importieren und indizieren muss. Beobachte die Logs mit `docker compose logs -f nominatim`, um den Fortschritt zu sehen. Warte, bis der Import abgeschlossen ist.

5.  **Datenbankmigrationen anwenden:**
    Nachdem die Container laufen (insbesondere `geo_db`), öffne ein **zweites Terminal** und führe die Datenbankmigrationen aus, um die `tasks`-Tabelle zu erstellen:
    ```bash
    docker compose exec geo_backend flask db upgrade
    ```
    Falls du das Projekt zum ersten Mal initialisierst, musst du eventuell vorher `docker compose exec geo_backend flask db init` und `docker compose exec geo_backend flask db migrate` ausführen. `flask db upgrade` sollte aber ausreichen, wenn die Migrationen bereits im Git-Repository sind.

### Anwendung nutzen

-   **Frontend:** Öffne deinen Browser unter `http://localhost:8100`
-   **Backend API:** Die API ist unter `http://localhost:5000/api` erreichbar.
-   **Lokaler Nominatim-Server:** Ist unter `http://localhost:8090` erreichbar (zum direkten Testen).

---

## Entwicklungsworkflow

### Datenbankmigrationen

Wenn du Änderungen am SQLAlchemy-Modell in `backend/app/models.py` vornimmst:
1.  Erstelle eine neue Migrationsdatei:
    ```bash
    docker compose exec geo_backend flask db migrate -m "Eine beschreibende Nachricht über die Änderung"
    ```
2.  Überprüfe die generierte Datei in `backend/migrations/versions/`. Passe sie bei Bedarf manuell an (z.B. um `import geoalchemy2` hinzuzufügen).
3.  Wende die Migration auf die Datenbank an:
    ```bash
    docker compose exec geo_backend flask db upgrade
    ```

### Abhängigkeiten installieren

-   **Backend (Python):** Füge das Paket zur `backend/requirements.txt` hinzu und baue das Image neu:
    ```bash
    docker compose up --build backend
    ```
-   **Frontend (Node.js):** Führe `npm install` im Frontend-Container aus:
    ```bash
    docker compose exec geo_frontend npm install <paket-name> --save
    ```

### Konfiguration

-   **Backend:** Wird über die `backend/.env`-Datei gesteuert.
-   **Frontend:** In `frontend/src/environments/environment.ts` kann über die Variable `useLocalNominatim` zwischen dem lokalen und dem öffentlichen Nominatim-Dienst umgeschaltet werden.
    ```typescript
    // environment.ts
    export const environment = {
      production: false,
      useLocalNominatim: true, // true = localhost:8090, false = nominatim.openstreetmap.org
      // ...
    };
    ```

---

## Geplante Features

- Benutzerauthentifizierung (Registrierung, Login)
- Anzeige von statischen Kartenbildern als Vorschau (Performance-Alternative)
- Button "Meinen aktuellen Standort verwenden" mit Geräte-GPS
- Komplexere räumliche Abfragen (z.B. "Zeige Aufgaben in meiner Nähe")
- Unit- und Integrationstests

---
