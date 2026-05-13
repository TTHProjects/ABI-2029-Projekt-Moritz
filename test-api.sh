#!/bin/bash

# test-api.sh - Einfache API-Tests für Entwicklung

BASE_URL="http://localhost:3000"

echo "🧪 ABI-2029 API Tests"
echo "===================="
echo ""

# Test 1: Login-Seite laden
echo "[1] GET /login"
curl -s "$BASE_URL/login" | head -c 100
echo "..."
echo ""

# Test 2: Dashboard (ohne Auth sollte zu Login redirecten)
echo "[2] GET /dashboard (ohne Session)"
curl -s -L "$BASE_URL/dashboard" | head -c 100
echo "..."
echo ""

# Test 3: API Profile (ohne Auth)
echo "[3] GET /api/profile (ohne Session)"
curl -s "$BASE_URL/api/profile" | jq .
echo ""

echo "✅ API Tests abgeschlossen"
