# 🛠️ DEVELOPMENT GUIDE - ABI-2029

Entwickler-Handbuch für das ABI-2029 Website-Projekt.

## ⚙️ Setup für Entwicklung

### 1. Repository klonen
```bash
git clone <repo-url>
cd ABI-2029-Projekt-Moritz
```

### 2. Setup ausführen
```bash
bash setup.sh
```

Das Script führt automatisch aus:
- `npm install` aller Dependencies
- Generierung von kryptographischen Keys
- Root Admin Konfiguration
- Ordnerstruktur-Erstellung
- .env Datei-Schreiben

### 3. Server starten
```bash
npm run dev
```

Der Server läuft auf `http://localhost:3000`

## 🗂️ Dateistruktur erklärt

```
├── server.js              # Haupt-Server mit Express, Routes, Auth
├── encryption.js          # AES-256-GCM Verschlüsselung
├── admin-cli.js           # CLI-Tool für User-Verwaltung
├── package.json           # Dependencies und Scripts
├── setup.sh               # Automatisches Initial-Setup
├── start-dev.sh           # Dev-Start mit Checks
├── test-api.sh            # API-Test-Script
│
├── views/
│   └── index.ejs          # Zentrale Template (alle Pages)
│
├── public/
│   ├── css/               # Später: Custom CSS
│   ├── js/                # Später: Client-seitiges JS
│   └── images/            # Logos, Icons, etc.
│
└── db/
    └── database.json      # Verschlüsselte Datenbank (NICHT committen)
```

## 🔧 Häufige Aufgaben

### Neuen Benutzer hinzufügen
```bash
node admin-cli.js add-user max@example.com "Max Mustermann" password123 user
```

### Alle User anzeigen
```bash
node admin-cli.js list-users
```

### User freigeben (approve)
```bash
node admin-cli.js approve-user max@example.com
```

### Benutzer löschen
```bash
node admin-cli.js delete-user max@example.com
```

### Datenbank zurücksetzen (ACHTUNG!)
```bash
node admin-cli.js reset-database --force
```

## 🎨 Frontend-Entwicklung

### Template-System (EJS)

Die `views/index.ejs` rendert verschiedene Pages basierend auf einer `page`-Variable:

```javascript
// In server.js
app.get('/new-page', isAuthenticated, (req, res) => {
  res.render('index', {
    page: 'new-page',        // Diese Variable steuert die Page
    user: req.session.user,
    data: { /* ... */ }
  });
});
```

```html
<!-- In views/index.ejs -->
<% } else if (page === 'new-page') { %>
  <!-- Deine neue Page hier -->
<% } %>
```

### Liquid Glass Design

Verfügbare CSS-Klassen:
- `.glass` - Großes Glass-Element
- `.glass-sm` - Kleineres Glass-Element
- `.card` - Flex Card mit Hover-Effekt
- `.btn-primary` - Haupt-Button (lila Gradient)
- `.btn-secondary` - Sekundärer Button
- `.text-gradient` - Text mit Gradient-Effekt
- `.status-badge` - Status-Badge (paid, pending, etc.)

### Theme-Variablen
```css
--primary: #0a0f1e        /* Dunkles Blau */
--secondary: #2d0a4e      /* Lila */
--accent: #7c3aed         /* Bright Purple */
--glass-light: rgba(255, 255, 255, 0.1)
--glass-border: rgba(255, 255, 255, 0.2)
```

## 🔐 Authentifizierung

### Root Admin (Hardcoded)
```javascript
// In server.js
if (email === process.env.ROOT_ADMIN_EMAIL) {
  const passwordHash = process.env.ROOT_ADMIN_PASSWORD_HASH;
  if (bcrypt.compareSync(password, passwordHash)) {
    // Login erfolgreich
  }
}
```

### Regular User (aus Datenbank)
```javascript
const user = database.users.find(u => u.email === email);
if (user && bcrypt.compareSync(password, user.passwordHash)) {
  // Login erfolgreich
}
```

## 🗄️ Datenbank-Struktur

```javascript
{
  users: [
    {
      id: "user_1234567890",
      email: "max@example.com",
      name: "Max Mustermann",
      passwordHash: "$2a$10$...",
      role: "user",              // "user", "kasse", "planung", "admin"
      approved: true,
      createdAt: "2026-05-13T10:30:00Z"
    }
  ],
  events: [
    {
      id: "event_...",
      title: "Abiturfeier",
      date: "2026-06-15",
      description: "...",
      createdBy: "user_id"
    }
  ],
  payments: [
    {
      id: "payment_...",
      userId: "user_id",
      amount: 100,
      paid: true,
      date: "2026-05-13"
    }
  ],
  news: [
    {
      id: "news_...",
      title: "Wichtige Ankündigung",
      content: "...",
      createdBy: "user_id",
      createdAt: "2026-05-13T10:30:00Z"
    }
  ]
}
```

## 🔒 Sicherheit bei der Entwicklung

1. **Nie .env committen** - Sie wird automatisch in .gitignore ignoriert
2. **Keys nicht loggen** - Keine sensiblen Daten in der Console
3. **Passwords hashen** - Immer bcrypt verwenden, nie Plaintext
4. **HTTPS in Production** - NODE_ENV=production + Secure Cookies
5. **Validierung** - Input immer validieren auf dem Server
6. **RBAC** - Immer Role-basierte Checks implementieren

## 📊 Debugging

### Server-Logs
```bash
# Im Development
npm run dev

# Logs werden in der Console angezeigt
```

### Datenbank anschauen
```bash
node admin-cli.js show-database
```

### Vollständige DB ansehen (entschlüsselt)
```javascript
// In Node REPL
const DatabaseEncryption = require('./encryption');
const enc = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);
const db = enc.readEncryptedFile('./db/database.json');
console.log(JSON.stringify(db, null, 2));
```

## 🚀 Deployment

### Production Build
```bash
NODE_ENV=production npm start
```

### Environment Variables
- `NODE_ENV=production`
- `PORT=3000` (oder andere)
- `ROOT_ADMIN_EMAIL`, `ROOT_ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`, `DB_ENCRYPTION_KEY`
- `DB_PATH=./db/database.json`

### Wichtig für Production
1. **HTTPS aktivieren** (mit Nginx/Apache)
2. **Backup .env Datei** (Die Keys sind nicht rekonstruierbar!)
3. **DB Backups** (Regelmäßig database.json sichern)
4. **Log-Rotation** (Logs in Datei schreiben)
5. **Process Manager** (PM2 oder ähnlich)

## 📝 API Referenz

### Authentication Routes
```
POST /login              - Login (email, password)
GET  /logout             - Abmelden
GET  /api/profile        - Aktuelles Profil (JSON)
```

### User Routes
```
GET  /dashboard          - Schüler-Dashboard
GET  /admin              - Admin-Panel (nur Admin)
```

### Middleware
```javascript
isAuthenticated         - Überprüft Session
isAdmin                 - Überprüft Admin-Role
isRootAdmin             - Überprüft Root-Admin
```

## 🐛 Häufige Fehler

### "Encryption key must be 32 bytes"
- DB_ENCRYPTION_KEY muss exakt 32 Bytes (64 Hex-Zeichen) sein
- Wird von setup.sh automatisch generiert

### "Session not found"
- Cookies müssen im Browser aktiviert sein
- HttpOnly Cookies können nicht von JS gelesen werden

### Database locked
- Wenn mehrere Node-Prozesse gleichzeitig schreiben
- Nutze ein Locking-System oder Datenbank (später)

---

**Viel Erfolg beim Entwickeln! 🚀**
