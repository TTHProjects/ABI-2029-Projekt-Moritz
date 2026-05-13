# ⚡ QUICK REFERENCE - ABI-2029

Schnelle Übersicht der wichtigsten Befehle und Konzepte.

---

## 🚀 Getting Started (5 Minuten)

```bash
# 1. Repository klonen/öffnen
cd /workspaces/ABI-2029-Projekt-Moritz

# 2. Setup ausführen
bash setup.sh

# 3. Server starten
npm run dev

# 4. Browser öffnen
http://localhost:3000
```

---

## 📝 Common Commands

### Development

```bash
npm start           # Production Mode
npm run dev         # Development (Hot-Reload)
bash start-dev.sh   # Dev mit Auto-Checks
```

### User Management

```bash
# Neuen User hinzufügen
node admin-cli.js add-user max@example.com "Max Mustermann" password123 user

# Alle User anzeigen
node admin-cli.js list-users

# User freigeben
node admin-cli.js approve-user max@example.com

# User löschen
node admin-cli.js delete-user max@example.com

# Datenbank-Status anzeigen
node admin-cli.js show-database

# Datenbank löschen (ACHTUNG!)
node admin-cli.js reset-database --force
```

### Debugging

```bash
# Test die API
bash test-api.sh

# Node REPL mit Kontext
node -e "console.log(process.env.DB_ENCRYPTION_KEY)"

# Datenbank anschauen
node -e "
require('dotenv').config();
const DatabaseEncryption = require('./encryption');
const enc = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);
const db = enc.readEncryptedFile('./db/database.json');
console.log(JSON.stringify(db, null, 2));
"
```

### NPM / Dependencies

```bash
npm install             # Dependencies installieren
npm audit              # Sicherheits-Scan
npm audit fix          # Auto-Fix (wenn möglich)
npm update             # Dependencies aktualisieren
npm list               # Alle Packages anzeigen
```

---

## 📂 File Navigation

| Datei | Zweck |
|-------|-------|
| `server.js` | Hauptserver & Routes |
| `encryption.js` | Verschlüsselung |
| `admin-cli.js` | Admin-Befehle |
| `views/index.ejs` | Frontend Template |
| `.env` | Geheime Variablen |
| `db/database.json` | Datenbank (verschlüsselt) |
| `package.json` | Dependencies |
| `README.md` | Projekt-Übersicht |
| `DEVELOPMENT.md` | Dev-Handbuch |
| `SECURITY.md` | Sicherheits-Guide |

---

## 🔑 Environment Variables

```bash
NODE_ENV=production|development
PORT=3000
ROOT_ADMIN_EMAIL=...
ROOT_ADMIN_PASSWORD_HASH=...
SESSION_SECRET=...
DB_ENCRYPTION_KEY=...
DB_PATH=./db/database.json
```

---

## 🌐 API Endpoints

```
GET  /               Redirect zu /dashboard oder /login
GET  /login          Login-Seite
POST /login          Login mit Email + Password
GET  /logout         Abmelden
GET  /dashboard      Schüler-Dashboard
GET  /admin          Admin-Panel (nur Admin)
GET  /api/profile    Profil als JSON
```

---

## 👥 User Roles

```
root-admin   Absolute Kontrolle
admin        User & System Management
kasse        Zahlungen & Konten
planung      Events & News
user         Nur Sicht auf Dashboard
```

---

## 🔐 Sicherheit Basics

```javascript
// Passwort hashing
bcryptjs.hashSync(password, 10)

// Passwort vergleichen
bcryptjs.compareSync(password, hash)

// Datenbank verschlüsseln
encryption.writeEncryptedFile(path, data)

// Datenbank entschlüsseln
encryption.readEncryptedFile(path)

// Session setzen
req.session.user = { id, email, role, ... }

// Middleware: Nur authentifiziert
app.get('/protected', isAuthenticated, handler)

// Middleware: Nur Admin
app.get('/admin', isAuthenticated, isAdmin, handler)
```

---

## 🎨 Frontend Classes

```html
<!-- Liquid Glass Komponenten -->
<div class="glass">...</div>          <!-- Großes Glass-Element -->
<div class="glass-sm">...</div>       <!-- Kleines Glass-Element -->
<div class="glass-hover">...</div>    <!-- Mit Hover-Effekt -->

<!-- Buttons -->
<button class="btn-primary">Primär</button>
<button class="btn-secondary">Sekundär</button>

<!-- Status Badges -->
<span class="status-badge status-paid">Bezahlt</span>
<span class="status-badge status-pending">Ausstehend</span>

<!-- Cards -->
<div class="card">...</div>           <!-- Flex Card -->

<!-- Text -->
<h1 class="text-gradient">Text mit Gradient</h1>

<!-- Alerts -->
<div class="alert alert-error">...</div>
<div class="alert alert-success">...</div>
<div class="alert alert-info">...</div>
```

---

## 🐛 Troubleshooting

### Server startet nicht
```bash
# Error: Port 3000 already in use
PORT=3001 npm start

# Error: Cannot find module
npm install

# Error: .env not found
bash setup.sh
```

### Login funktioniert nicht
```bash
# Passwort Hash überprüfen
node -e "
const bcrypt = require('bcryptjs');
const hash = process.env.ROOT_ADMIN_PASSWORD_HASH;
console.log(bcrypt.compareSync('dein-passwort', hash));
"

# User nicht freigeschaltet?
node admin-cli.js approve-user max@example.com
```

### Datenbank beschädigt
```bash
# Backup sichern
cp db/database.json db/database.json.broken

# Zurücksetzen
node admin-cli.js reset-database --force

# Oder manuell .env überprüfen
cat .env
```

---

## 📚 Dokumentation

| Datei | Inhaltstoff |
|-------|---|
| `README.md` | Projekt-Übersicht, Features |
| `INSTALLATION.md` | Schritt-für-Schritt Installation |
| `DEVELOPMENT.md` | Entwickler-Guide, Code-Patterns |
| `SECURITY.md` | Sicherheits-Architektur, Best Practices |
| `API-DOCS.md` | Endpoint-Referenz |
| `ARCHITECTURE.md` | System-Design, Data Flows |
| `CHANGELOG.md` | Release-Notes, Versionshistorie |
| `QUICK-REFERENCE.md` | Diese Datei |

---

## 🎯 Häufige Tasks

### "Ich will einen neuen User hinzufügen"
```bash
node admin-cli.js add-user max@example.com "Max" password123 user
node admin-cli.js approve-user max@example.com
```

### "Ich will die Datenbank anschauen"
```bash
node admin-cli.js show-database
```

### "Ich will die Datenbank zurücksetzen"
```bash
node admin-cli.js reset-database --force
```

### "Ich will einen neuen Admin-User erstellen"
```bash
node admin-cli.js add-user admin@example.com "Admin User" password123 admin
node admin-cli.js approve-user admin@example.com
```

### "Ich will neue Features hinzufügen"
1. Öffne `server.js`
2. Füge neue Route hinzu: `app.get('/new-page', ...)`
3. Öffne `views/index.ejs`
4. Füge neues Template-Section hinzu: `<% } else if (page === 'new-page') { %>`

### "Ich will den Server starten"
```bash
npm run dev        # Oder npm start für Production
```

---

## ✅ Deployment Checklist

- [ ] .env sicher verwahren (nicht committen)
- [ ] NODE_ENV=production
- [ ] HTTPS aktivieren
- [ ] DATABASE Backup machen
- [ ] npm audit durchführen
- [ ] Tests laufen
- [ ] Security Review done
- [ ] Monitoring aktiviert

---

## 🔗 Nützliche Links

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [EJS Template Engine](https://ejs.co/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [AES-256-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)

---

## 💬 Need Help?

1. Überprüfe die [DEVELOPMENT.md](DEVELOPMENT.md)
2. Lese [SECURITY.md](SECURITY.md) für Sicherheits-Fragen
3. Schaue [API-DOCS.md](API-DOCS.md) für API-Fragen
4. Überprüfe die Fehlerausgabe: `npm run dev 2>&1 | grep -i error`

---

**Quick Reference v1.0 | ABI-2029**
