#!/bin/bash

# start-dev.sh - Schnellstart für die Entwicklung
# Überprüft, ob .env existiert, sonst wird setup.sh aufgerufen

echo "🚀 ABI-2029 Development Start"
echo "=============================="
echo ""

# Überprüfe, ob .env existiert
if [ ! -f .env ]; then
    echo "⚠️  .env nicht gefunden. Starte setup.sh..."
    echo ""
    bash setup.sh
    echo ""
fi

# Überprüfe, ob node_modules existiert
if [ ! -d node_modules ]; then
    echo "📦 Installiere Dependencies..."
    npm install
    echo ""
fi

echo "✅ Starte Server..."
echo ""
npm run dev
