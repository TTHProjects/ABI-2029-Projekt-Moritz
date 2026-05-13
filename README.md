# 🎓 ABI-2029 Website | Maria-Wächtler Gymnasium

**SHADOW-JSON**: Eine hochsichere, autarke Web-Anwendung für die Verwaltung des Abiturjahrgangs 2029.

## 🎨 Features

### Backend
- **Node.js + Express**: Robuste REST-API und Template-Rendering
- **AES-256-GCM Verschlüsselung**: Alle Daten im Ruhezustand verschlüsselt
- **Lokale JSON-Datenbank**: Keine externe DB-Abhängigkeit
- **Bcrypt Passwort-Hashing**: Sichere Authentifizierung
- **Role-Based Access Control (RBAC)**: Admin, Kasse, Planung, User

### Frontend
- **Liquid Glass Design**: Modernes, gläsernes UI mit Backdrop-Blur
- **Tailwind CSS**: Responsive und elegant
- **EJS Template Engine**: Dynamisches Rendering
- **Dark Mode**: Dunkles Blau (#0a0f1e) mit Lila-Akzenten (#2d0a4e)

### Sicherheit
- **Root Admin Hardcoding**: Über Umgebungsvariablen
- **Session Management**: Sichere Cookies mit httpOnly & sameSite
- **No SMTP**: Keine Mail-Abhängigkeit, manuelle Admin-Freigabe
- **Encryption at Rest**: AES-256-GCM für alle JSON-Dateien

## 🚀 Quick Start

### 1. Automatisches Setup
```bash
bash setup.sh
```

Das Script führt folgende Schritte automatisch durch:
- ✅ npm install
- ✅ Kryptografische Keys generieren
- ✅ Root Admin konfigurieren
- ✅ Ordnerstruktur erstellen
- ✅ .env Datei schreiben

### 2. Starten des Servers
```bash
# Production
npm start

# Development (mit Hot-Reload)
npm run dev
```

### 3. Login
- **URL**: `http://localhost:3000`
- **Root Admin Email**: (siehe .env)
- **Root Admin Password**: (wurde bei setup.sh gesetzt)

## 📁 Projektstruktur

```
ABI-2029-Projekt-Moritz/
├── server.js              # Express Hauptserver
├── encryption.js          # AES-256-GCM Verschlüsselung
├── setup.sh               # Automatisches Setup-Script
├── package.json           # Dependencies
├── .env                   # Umgebungsvariablen (NICHT committen!)
├── .env.example           # Template für .env
├── .gitignore             # Git-Konfiguration
│
├── db/                    # Datenbank (verschlüsselt)
│   └── database.json      # JSON-Datei (im RAM entschlüsselt)
│
├── views/                 # EJS Templates
│   └── index.ejs          # Zentrale Template-Datei
│
├── public/                # Statische Dateien
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   └── images/            # Bilder
│
└── logs/                  # Server Logs
```

## 🔐 Sicherheits-Architektur

### Datenbank-Verschlüsselung
1. **Schreiben**: JSON → Verschlüsseln (AES-256-GCM) → Base64 → Datei
2. **Lesen**: Datei → Base64 → Entschlüsseln (AES-256-GCM) → JSON → RAM

### Authentication
- **Root Admin**: Hartcodiert in .env, bcrypt-gehashed
- **Regular User**: In verschlüsselter JSON-DB, bcrypt-gehashed
- **Session**: Express-Session mit HttpOnly Cookies

### Keys
- **SESSION_SECRET**: Zufällig generiert, 64 Zeichen Hex (32 Bytes)
- **DB_ENCRYPTION_KEY**: Zufällig generiert, 32 Zeichen Hex (16 Bytes)

**Wichtig**: Diese Keys NICHT committen! Sie werden von setup.sh in .env generiert.

## 👥 User Roles

| Rolle | Berechtigungen |
|-------|---|
| **Root Admin** | Absolute Kontrolle, User-Verwaltung |
| **Admin** | User-Freigabe, Rollenverteilung |
| **Kasse** | Zahlungen quittieren, Konten einsehen |
| **Planung** | Events und News erstellen |
| **User** | Dashboard, Abikassa, Event-Kalender |

## 🛠️ Entwicklung

### Dependencies
- `express`: ^4.18.2 - Web Framework
- `ejs`: ^3.1.8 - Template Engine
- `bcryptjs`: ^2.4.3 - Passwort-Hashing
- `dotenv`: ^16.0.3 - Umgebungsvariablen
- `express-session`: ^1.17.3 - Session Management

### Dev Dependencies
- `nodemon`: ^2.0.20 - Auto-Reload beim Speichern

### Neuen Feature hinzufügen

1. **Route in server.js**:
```javascript
app.get('/feature', isAuthenticated, (req, res) => {
  res.render('index', {
    page: 'feature',
    user: req.session.user
  });
});
```

2. **Template in views/index.ejs**:
```html
<% } else if (page === 'feature') { %>
  <!-- Dein Feature -->
<% } %>
```

## 📋 API Endpoints

```
GET  /               → Redirect zu Dashboard/Login
GET  /login          → Login-Seite
POST /login          → Login-Verarbeitung
GET  /logout         → Abmelden
GET  /dashboard      → Schüler-Dashboard
GET  /admin          → Admin-Panel (nur Admins)
GET  /api/profile    → Aktuelles User-Profil (JSON)
```

## 🚨 Wichtige Hinweise

1. **Nie .env committen!** Sie wird in .gitignore ignoriert
2. **setup.sh nur einmal ausführen** bei der Initialisierung
3. **DB_ENCRYPTION_KEY verlieren = Datenverlust**. Backup machen!
4. **Root Admin Password** ist nur über .env erreichbar
5. **Production**: NODE_ENV=production und HTTPS aktivieren

## 📝 Lizenz

MIT License © 2026 Maria-Wächtler Gymnasium

---

**Entwickelt von**: Moritz  
**Projekt**: ABI-2029 Verwaltungsplattform  
**Tech-Stack**: Node.js, Express, EJS, Tailwind, AES-256-GCM