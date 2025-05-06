# frontend/Dockerfile

# Basierend auf einem offiziellen Node.js Image
# Wähle eine passende LTS-Version (z.B. 18 oder 20)
# Alpine ist kleiner, aber manchmal problematischer als slim/standard
FROM node:20-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json (oder yarn.lock)
COPY package*.json ./

# Installiere Projekt-Abhängigkeiten
RUN npm install

# Installiere Ionic und Angular CLIs global im Container
RUN npm install -g @ionic/cli @angular/cli

# Kopiere den restlichen Code der Anwendung
# Stelle sicher, dass eine .dockerignore Datei im frontend/ Verzeichnis existiert,
# um node_modules und andere unnötige Ordner auszuschließen.
COPY . .

# Ports, die Ionic Serve verwendet:
# 8100: Der Haupt-App-Port
# 35729: Live-Reload-Port
EXPOSE 8100 35729

# Standard-Befehl zum Starten des Ionic Dev Servers
# Wichtig: --host=0.0.0.0 damit der Server von außerhalb des Containers erreichbar ist
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--livereload-port=35729", "--external"]