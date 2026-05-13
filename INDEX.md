# 📚 DOCUMENTATION INDEX - ABI-2029

Vollständige Dokumentation der ABI-2029 Website.

---

## 🎯 Für verschiedene Rollen

### 👤 **Benutzer / Schüler**
→ Starten Sie hier: [INSTALLATION.md](INSTALLATION.md)
- Wie du dich registrierst und anmeldest
- Wie du dein Dashboard nutzt
- Abikassa und Events

### 👨‍💻 **Entwickler**
→ Starten Sie hier: [DEVELOPMENT.md](DEVELOPMENT.md)
- Setup für Entwicklung
- Code-Struktur verstehen
- Features hinzufügen
- Debugging-Tipps

### 🔐 **Security Officer / Admin**
→ Lesen Sie: [SECURITY.md](SECURITY.md)
- Sicherheits-Architektur
- Encryption-Details
- Best Practices
- Incident Response

### 🏗️ **Architekten / Tech Leads**
→ Überprüfen Sie: [ARCHITECTURE.md](ARCHITECTURE.md)
- System Design
- Data Flows
- Component Breakdown
- Scalability

### ⚡ **Schnelle Referenz**
→ Benötigen Sie einen Befehl? [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- Häufige Befehle
- Troubleshooting
- API Übersicht

---

## 📖 Dokumentations-Übersicht

| Dokument | Zielgruppe | Inhalt |
|----------|-----------|--------|
| **[README.md](README.md)** | Alle | Projekt-Übersicht, Features, Quick Start |
| **[INSTALLATION.md](INSTALLATION.md)** | Benutzer, Admins | Installation & erstes Starten |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** | Entwickler | Entwicklungs-Setup, Code-Patterns, Debugging |
| **[SECURITY.md](SECURITY.md)** | Security, Admins | Encryption, Auth, Vulnerabilities, Best Practices |
| **[API-DOCS.md](API-DOCS.md)** | Entwickler, Integrations | Alle API-Endpoints, Requests/Responses |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Tech Leads, Architekten | System-Design, Data Flows, Components |
| **[CHANGELOG.md](CHANGELOG.md)** | Alle | Release-Notes, Version-Historie, Roadmap |
| **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** | Alle | Schnelle Befehls-Übersicht |

---

## 🚀 Schnelleinstieg (5 Minuten)

### 1. Installation
```bash
bash setup.sh
npm run dev
```

### 2. Browser öffnen
```
http://localhost:3000
```

### 3. Login
- Email: (deine Root Admin Email aus setup.sh)
- Password: (dein Root Admin Password aus setup.sh)

**Fertig! ✅**

Für detaillierte Schritte siehe: [INSTALLATION.md](INSTALLATION.md)

---

## 📋 Wichtigste Befehle

### Starten

```bash
npm run dev           # Development Mode
npm start             # Production Mode
bash start-dev.sh     # Mit Auto-Checks
```

### User Management

```bash
# Neuen User erstellen
node admin-cli.js add-user email@example.com "Name" password role

# User freigeben
node admin-cli.js approve-user email@example.com

# Alle User anzeigen
node admin-cli.js list-users

# User löschen
node admin-cli.js delete-user email@example.com
```

Für mehr Commands siehe: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

---

## 🔐 Sicherheits-Checkliste

**Bei der Installation:**
- [ ] setup.sh ausführen
- [ ] .env generieren lassen (nicht manuell!)
- [ ] DB_ENCRYPTION_KEY sichern
- [ ] ROOT_ADMIN_PASSWORD sichern

**Bei der Entwicklung:**
- [ ] Nie .env committen
- [ ] Nur HTTPS in Production
- [ ] npm audit regelmäßig
- [ ] Code Review vor Deployment

Für vollständige Details siehe: [SECURITY.md](SECURITY.md)

---

## 🎨 Design System

Alle Seiten verwenden das **Liquid Glass Design**:
- 🎨 Dunkles Blau: `#0a0f1e`
- 💜 Lila-Akzente: `#2d0a4e`
- ✨ Backdrop-Blur und glänzende Oberflächen
- 📱 Responsive mit Tailwind CSS

Komponenten-Klassen im Frontend:
- `.glass` - Großes Glass-Element
- `.btn-primary` - Haupt-Button
- `.card` - Flex Card
- `.status-badge` - Status-Badge

---

## 👥 User Roles & Permissions

| Rolle | Zugriff |
|-------|---------|
| **root-admin** | ✅ Alles (absolute Kontrolle) |
| **admin** | ✅ User-Verwaltung, System |
| **kasse** | ✅ Zahlungen, Konten |
| **planung** | ✅ Events, News |
| **user** | ✅ Dashboard, Events, Abikassa |

---

## 🔄 Häufigste Workflows

### "Ich will einen neuen Admin hinzufügen"
```bash
node admin-cli.js add-user admin@example.com "Admin Name" password123 admin
node admin-cli.js approve-user admin@example.com
```

### "Ich will einen Fehler beheben"
1. Starte Server: `npm run dev`
2. Schaue Logs in der Console an
3. Öffne die betroffene Datei in VS Code
4. Bearbeite und speichere (Hot-Reload!)
5. Browser refresht automatisch

### "Ich will ein neues Feature hinzufügen"
1. Lese [DEVELOPMENT.md](DEVELOPMENT.md#Frontend-Entwicklung)
2. Füge Route in `server.js` hinzu
3. Füge Template in `views/index.ejs` hinzu
4. Teste im Browser
5. Commit & Push!

### "Ich will die Datenbank zurücksetzen"
```bash
node admin-cli.js reset-database --force
```

---

## 🆘 Häufige Probleme

### "Server startet nicht"
→ Siehe: [QUICK-REFERENCE.md#Troubleshooting](QUICK-REFERENCE.md#troubleshooting)

### "Login funktioniert nicht"
→ Siehe: [INSTALLATION.md#Häufige Probleme](INSTALLATION.md#häufige-probleme)

### "Datenbank korrupt"
→ Siehe: [QUICK-REFERENCE.md#Troubleshooting](QUICK-REFERENCE.md#troubleshooting)

---

## 📊 Projekt-Statistiken

- **Code Lines**: ~1,800+ (server.js, encryption.js, admin-cli.js, index.ejs)
- **Documentation**: ~2,500+ lines
- **Files**: 25+
- **Dependencies**: 5 (prod) + 1 (dev)
- **Setup Time**: 5-10 Minuten
- **First Deployment**: Bereit!

---

## 🗂️ Datei-Struktur

```
ABI-2029-Projekt-Moritz/
├── 📄 Core Code
│   ├── server.js              (825 lines - Hauptserver)
│   ├── encryption.js          (108 lines - Verschlüsselung)
│   ├── admin-cli.js           (285 lines - Admin CLI)
│   └── views/index.ejs        (620 lines - Frontend)
│
├── ⚙️ Configuration
│   ├── setup.sh               (135 lines - Initial Setup)
│   ├── start-dev.sh           (38 lines - Dev Start)
│   ├── test-api.sh            (30 lines - API Tests)
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── 📚 Documentation (8 Dateien)
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── DEVELOPMENT.md
│   ├── SECURITY.md
│   ├── API-DOCS.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   └── QUICK-REFERENCE.md
│
├── 📁 Ordner
│   ├── db/                    (Datenbank)
│   ├── public/                (Statische Dateien)
│   ├── views/                 (Templates)
│   ├── logs/                  (Server Logs)
│   └── node_modules/          (Dependencies)
│
└── 🔐 Secrets (nicht committen!)
    └── .env                   (Umgebungsvariablen)
```

---

## ✅ Implementierte Features

- ✅ User Authentication (Root Admin + Regular)
- ✅ Role-Based Access Control (RBAC)
- ✅ AES-256-GCM Encryption
- ✅ Bcrypt Password Hashing
- ✅ Session Management
- ✅ Admin CLI Tool
- ✅ Liquid Glass UI Design
- ✅ Responsive Layout
- ✅ API Endpoints
- ✅ Complete Documentation

---

## 🚀 Nächste Schritte

1. **Installation**: Folge [INSTALLATION.md](INSTALLATION.md)
2. **Entwicklung**: Lese [DEVELOPMENT.md](DEVELOPMENT.md)
3. **Sicherheit**: Überprüfe [SECURITY.md](SECURITY.md)
4. **Deployment**: Plan mit [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🤝 Kontakt & Support

- **GitHub**: [Repository Link] - wird noch hinzugefügt
- **Issues**: [Issue Tracker] - wird noch hinzugefügt
- **Docs**: Du bist hier! 📖

---

## 📝 Version

**ABI-2029 Website v1.0.0**
- Released: 2026-05-13
- Status: ✅ Production Ready
- License: MIT

---

**Willkommen bei ABI-2029! 🎓**

Viel Erfolg mit der Website!
