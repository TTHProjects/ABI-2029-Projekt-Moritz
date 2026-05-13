#!/bin/bash

# ABI-2029 SHADOW-JSON Setup Script
# Automatische Initialisierung der Webseite mit sicherer Konfiguration

set -e

echo "================================================"
echo "ABI-2029 Website Setup"
echo "Maria-Wächtler Gymnasium"
echo "================================================"
echo ""

# 0. Alte Setup-Strukturen bereinigen
echo "[0/5] Bereinige alte Setup-Strukturen..."
if [ -f .env ]; then
  rm -f .env
  echo "✓ Alte .env entfernt"
fi
if [ -f db/database.json ]; then
  rm -f db/database.json
  echo "✓ Alte Datenbankdatei entfernt"
fi
if [ -d logs ]; then
  rm -rf logs
  echo "✓ Alte Logs entfernt"
fi
echo "✓ Bereinigung abgeschlossen"
echo ""

# 1. Dependencies installieren
echo "[1/5] Installiere npm Dependencies..."
npm install
echo "✓ npm Dependencies installiert"
echo ""

# 2. Kryptografisch sichere Keys generieren
echo "[2/5] Generiere kryptografische Keys..."
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DB_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✓ SESSION_SECRET: ${SESSION_SECRET:0:16}..."
echo "✓ DB_ENCRYPTION_KEY: ${DB_ENCRYPTION_KEY:0:16}..."
echo ""

# 3. Root Admin Konfiguration
echo "[3/5] Konfiguriere Root Admin..."
read -p "Root Admin Email: " ROOT_ADMIN_EMAIL
read -sp "Root Admin Passwort (verborgen): " ROOT_ADMIN_PASSWORD
echo ""

# Bcrypt Hash generieren (Node.js)
ROOT_ADMIN_PASSWORD_HASH=$(node -e "
const bcrypt = require('bcryptjs');
const password = process.argv[1];
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
" "$ROOT_ADMIN_PASSWORD")

echo "✓ Root Admin konfiguriert"
echo ""

# 4. .env Datei erstellen
echo "[4/5] Erstelle .env Datei..."
cat > .env << EOF
NODE_ENV=production
PORT=4011

# Root Admin (Hardcoded)
ROOT_ADMIN_EMAIL=$ROOT_ADMIN_EMAIL
ROOT_ADMIN_PASSWORD_HASH=$ROOT_ADMIN_PASSWORD_HASH

# Session & Encryption
SESSION_SECRET=$SESSION_SECRET
DB_ENCRYPTION_KEY=$DB_ENCRYPTION_KEY

# Database
DB_PATH=./db/database.json
EOF

echo "✓ .env Datei erstellt"
echo ""

# 5. Ordnerstruktur erstellen
echo "[5/5] Erstelle Ordnerstruktur..."
mkdir -p db
mkdir -p public/css
mkdir -p public/js
mkdir -p public/images
mkdir -p views
mkdir -p logs

# WICHTIG: Keine Klartext-Datenbank anlegen.
# Die verschlüsselte DB wird beim ersten Serverstart automatisch erstellt.

echo "✓ Ordnerstruktur erstellt"
echo ""

# 6. .gitignore erstellen
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
db/database.json
logs/
.DS_Store
*.log
session/
EOF

echo "✓ .gitignore erstellt"
echo ""

echo "================================================"
echo "✓ Setup abgeschlossen!"
echo "================================================"
echo ""
echo "Nächste Schritte:"
echo "1. npm run dev       - Startet den Dev-Server"
echo "2. http://localhost:3000 - Öffne die Website"
echo ""
echo "Umgebungsvariablen gespeichert in: .env"
echo "ACHTUNG: .env ist sensibel! Nicht committen!"
echo ""
