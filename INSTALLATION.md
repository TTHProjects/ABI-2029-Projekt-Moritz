# 📋 INSTALLATION GUIDE - ABI-2029 Website

Schritt-für-Schritt-Anleitung zum Installieren und Starten der ABI-2029 Website.

## ✅ Anforderungen

- **Node.js** 14+ (getestet mit Node 18+)
- **npm** 7+
- **Git** (optional, wenn aus Repository klonen)
- Moderne Browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation (Option 1: Automatisch mit setup.sh)

### Schritt 1: Repository vorbereiten
```bash
# Wenn geklont aus Git:
git clone <repo-url>
cd ABI-2029-Projekt-Moritz

# Oder lokal:
cd /path/to/ABI-2029-Projekt-Moritz
```

### Schritt 2: Setup-Script ausführen
```bash
bash setup.sh
```

Das Script wird Sie auffordern:
1. **Root Admin Email eingeben** (z.B. `admin@abi2029.local`)
2. **Root Admin Password eingeben** (wird gehashed, nicht sichtbar)

Dann werden automatisch:
- ✅ npm dependencies installiert
- ✅ Kryptographische Keys generiert
- ✅ .env Datei erstellt
- ✅ Ordnerstruktur erstellt
- ✅ Datenbank initialisiert

### Schritt 3: Server starten
```bash
npm run dev
```

**Output sollte sein:**
```
╔════════════════════════════════════════════════════════╗
║        ABI-2029 Website - SHADOW-JSON Server          ║
╠════════════════════════════════════════════════════════╣
║  🚀 Server läuft auf http://localhost:3000            ║
║  📁 Datenbank: ./db/database.json                     ║
║  🔐 Verschlüsselung: AES-256-GCM                      ║
╚════════════════════════════════════════════════════════╝
```

### Schritt 4: Login
Öffne im Browser: **http://localhost:3000**

Login mit:
- **Email**: (die Root Admin Email, die du bei setup.sh eingegeben hast)
- **Password**: (das Passwort, das du bei setup.sh eingegeben hast)

**✅ Success!** Du bist nun als Root Admin eingeloggt.

---

## 🚀 Installation (Option 2: Manuell)

Falls setup.sh nicht funktioniert oder du es manuell tun möchtest:

### 1. Dependencies installieren
```bash
npm install
```

### 2. Kryptographische Keys generieren
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Speichere das Ergebnis irgendwo - das ist dein SESSION_SECRET.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Das ist dein DB_ENCRYPTION_KEY.

### 3. Root Admin Password hashen
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('dein-passwort', 10))"
```
Speichere das Ergebnis - das ist dein ROOT_ADMIN_PASSWORD_HASH.

### 4. .env Datei erstellen
Erstelle `.env` im Root-Verzeichnis:
```
NODE_ENV=production
PORT=3000

ROOT_ADMIN_EMAIL=admin@example.com
ROOT_ADMIN_PASSWORD_HASH=$2a$10$....(der hash von oben)

SESSION_SECRET=....(die 64 hex-zeichen)
DB_ENCRYPTION_KEY=....(die 64 hex-zeichen)

DB_PATH=./db/database.json
```

### 5. Ordnerstruktur erstellen
```bash
mkdir -p db
mkdir -p public/css
mkdir -p public/js
mkdir -p public/images
mkdir -p views
mkdir -p logs
```

### 6. Datenbank initialisieren
```bash
node -e "
const DatabaseEncryption = require('./encryption');
require('dotenv').config();
const enc = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);
const initialDb = { users: [], events: [], payments: [], news: [] };
enc.writeEncryptedFile('./db/database.json', initialDb);
console.log('✅ Datenbank erstellt');
"
```

### 7. Server starten
```bash
npm start
```

---

## ⚠️ Häufige Probleme

### Problem: "Encryption key must be 32 bytes"

**Lösung**: Der DB_ENCRYPTION_KEY muss exakt 64 Hex-Zeichen sein (32 Bytes).

Richtig:
```
DB_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

Falsch:
```
DB_ENCRYPTION_KEY=0123456789abcdef
```

### Problem: "Cannot find module 'express'"

**Lösung**:
```bash
npm install
```

Stelle sicher, dass `node_modules/` existiert.

### Problem: "Cannot GET /dashboard"

**Lösung**: Du musst zuerst eingeloggt sein. Gehe zu http://localhost:3000/login

### Problem: Server startet nicht

**Mögliche Ursachen:**
1. Port 3000 ist bereits belegt → `PORT=3001 npm start`
2. .env ist nicht richtig → `npm run setup.sh` neu ausführen
3. Datenbank korrupt → `node admin-cli.js reset-database --force`

### Problem: "session secret undefined"

**Lösung**: SESSION_SECRET in .env nicht gesetzt. Führe setup.sh aus oder setze den Wert manuell.

---

## 🔧 Nach der Installation

### Benutzer hinzufügen
```bash
node admin-cli.js add-user max@example.com "Max Mustermann" password123 user
```

### Benutzer freigeben
```bash
node admin-cli.js approve-user max@example.com
```

### Benutzer anzeigen
```bash
node admin-cli.js list-users
```

### Datenbank anschauen
```bash
node admin-cli.js show-database
```

---

## 🚀 Starten / Stoppen

### Server starten
```bash
npm start              # Production
npm run dev            # Development (mit Hot-Reload)
bash start-dev.sh      # Mit Checks
```

### Server stoppen
```bash
Ctrl + C
```

---

## 📦 Backup & Sicherheit

### .env Datei backup
```bash
cp .env .env.backup
```

**ACHTUNG**: Nie .env commitzen oder sharen! Sie enthält:
- ROOT_ADMIN_PASSWORD_HASH
- SESSION_SECRET
- DB_ENCRYPTION_KEY

### Datenbank Backup
```bash
cp db/database.json db/database.json.backup.$(date +%s)
```

---

## ✨ Nächste Schritte

1. ✅ Server läuft
2. ✅ Root Admin Login funktioniert
3. 📝 [DEVELOPMENT.md](DEVELOPMENT.md) - Entwickler-Handbuch
4. 📖 [README.md](README.md) - Projekt-Übersicht

---

**Viel Erfolg! 🎓**
