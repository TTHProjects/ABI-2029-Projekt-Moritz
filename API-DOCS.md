# 📖 API DOCUMENTATION - ABI-2029

Vollständige REST API Dokumentation für das ABI-2029 Website-Projekt.

---

## 🔐 Authentication Endpoints

### POST /login
Login mit Email und Passwort

**Request:**
```http
POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

email=admin@example.com&password=mypassword
```

**Response (erfolgreich):**
```http
HTTP/1.1 302 Found
Location: /dashboard
Set-Cookie: connect.sid=...; HttpOnly; Secure; SameSite=Strict
```

**Response (Fehler):**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- Login-Seite mit Fehlermeldung -->
```

**Fehlermeldungen:**
- `Email oder Passwort falsch.`
- `Ihr Konto wurde noch nicht freigegeben.`

---

### GET /logout
Benutzer abmelden und Session zerstören

**Request:**
```http
GET /logout HTTP/1.1
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /login
Set-Cookie: connect.sid=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

## 👤 User Endpoints

### GET /api/profile
Aktuellas User-Profil abrufen (JSON)

**Request:**
```http
GET /api/profile HTTP/1.1
Cookie: connect.sid=...
```

**Response (erfolgreich):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "root-admin",
  "email": "admin@example.com",
  "name": "Root Administrator",
  "role": "admin",
  "isRootAdmin": true,
  "createdAt": "2026-05-13T10:30:00.000Z"
}
```

**Response (nicht authentifiziert):**
```http
HTTP/1.1 302 Found
Location: /login
```

---

## 📱 View Endpoints

### GET /
Hauptseite (automatischer Redirect)

**Request:**
```http
GET / HTTP/1.1
```

**Response (authentifiziert):**
```http
HTTP/1.1 302 Found
Location: /dashboard
```

**Response (nicht authentifiziert):**
```http
HTTP/1.1 302 Found
Location: /login
```

---

### GET /login
Login-Seite anzeigen

**Request:**
```http
GET /login HTTP/1.1
```

**Response:**
```html
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
  <!-- Login-Formular mit Liquid Glass Design -->
</html>
```

---

### GET /dashboard
Schüler-Dashboard (nur authentifizierte User)

**Request:**
```http
GET /dashboard HTTP/1.1
Cookie: connect.sid=...
```

**Response (erfolgreich):**
```html
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
  <!-- Dashboard mit:
       - Abikassa-Status
       - Event-Kalender
       - Neuigkeiten
  -->
</html>
```

**Response (nicht authentifiziert):**
```http
HTTP/1.1 302 Found
Location: /login
```

---

### GET /admin
Admin-Panel (nur Admin/Root Admin)

**Request:**
```http
GET /admin HTTP/1.1
Cookie: connect.sid=...
```

**Response (Admin):**
```html
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
  <!-- Admin-Panel mit:
       - User-Verwaltung
       - Kasse
       - Event-Planung
       - Systemeinstellungen
  -->
</html>
```

**Response (Regular User):**
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": "Zugriff verweigert"}
```

---

## 🛠️ Middleware

### isAuthenticated
Überprüft, ob der Benutzer authentifiziert ist

```javascript
app.get('/protected', isAuthenticated, (req, res) => {
  // Nur für eingeloggte User zugänglich
  res.send('Du bist eingeloggt');
});
```

**Verhalten:**
- ✅ Session vorhanden → weiter
- ❌ Keine Session → redirect zu /login

---

### isAdmin
Überprüft, ob der Benutzer Admin-Rolle hat

```javascript
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  // Nur für Admins zugänglich
});
```

**Verhalten:**
- ✅ Role === 'admin' oder isRootAdmin → weiter
- ❌ Andere Role → 403 Forbidden

---

### isRootAdmin
Überprüft, ob der Benutzer Root Admin ist

```javascript
app.get('/system', isAuthenticated, isRootAdmin, (req, res) => {
  // Nur für Root Admin
});
```

**Verhalten:**
- ✅ isRootAdmin === true → weiter
- ❌ Nicht Root Admin → 403 Forbidden

---

## 📊 HTTP Status Codes

| Code | Bedeutung | Beispiel |
|------|-----------|----------|
| 200 | OK | GET /dashboard erfolgreich |
| 302 | Redirect | /login → /dashboard redirect |
| 403 | Forbidden | Admin-Endpoint ohne Admin-Role |
| 404 | Not Found | /nicht-existierende-seite |
| 500 | Server Error | Fehler beim Laden der DB |

---

## 🍪 Cookies

### connect.sid
Express-Session Cookie

```
Name: connect.sid
Value: s%3A...
Path: /
Domain: localhost
Expires: (bei Browserschließung)
HttpOnly: true
Secure: true (in Production)
SameSite: Strict
```

---

## 🔄 Session Schema

```javascript
req.session = {
  user: {
    id: string,              // Unique User ID
    email: string,           // Email-Adresse
    name: string,            // Name des Users
    role: string,            // "user", "kasse", "planung", "admin"
    isRootAdmin: boolean,    // Ist Root Admin?
    createdAt: string        // ISO-Timestamp
  }
}
```

---

## 📝 Request/Response Beispiele

### Login mit Root Admin
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=mypassword" \
  -L
```

### Profil abrufen
```bash
curl http://localhost:3000/api/profile \
  -H "Cookie: connect.sid=..."
```

### Abmelden
```bash
curl http://localhost:3000/logout \
  -L
```

---

## 🚀 zukünftige API-Endpoints (TODO)

```
POST   /api/users              - Neuen User erstellen
GET    /api/users              - Alle User auflisten
PUT    /api/users/:id          - User bearbeiten
DELETE /api/users/:id          - User löschen

GET    /api/events             - Events auflisten
POST   /api/events             - Event erstellen
PUT    /api/events/:id         - Event bearbeiten
DELETE /api/events/:id         - Event löschen

POST   /api/payments           - Zahlung quittieren
GET    /api/payments/:userId   - Zahlungen eines Users

GET    /api/news               - News auflisten
POST   /api/news               - News erstellen
PUT    /api/news/:id           - News bearbeiten
DELETE /api/news/:id           - News löschen
```

---

## 🔐 Error Handling

### Standard Error Response
```json
{
  "error": "Beschreibung des Fehlers"
}
```

### Beispiel: API Error
```json
{
  "error": "Zugriff verweigert"
}
```

---

## 📖 Verwendung in Frontend

### Beispiel: Login in JavaScript
```javascript
async function login(email, password) {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);

  const response = await fetch('/login', {
    method: 'POST',
    body: form
  });

  if (response.ok && response.url.includes('/dashboard')) {
    console.log('Login erfolgreich!');
    window.location.href = '/dashboard';
  } else {
    console.log('Login fehlgeschlagen');
  }
}
```

### Beispiel: Profil abrufen
```javascript
async function getProfile() {
  const response = await fetch('/api/profile');

  if (response.ok) {
    const user = await response.json();
    console.log('Benutzer:', user);
  } else if (response.status === 302) {
    console.log('Nicht authentifiziert, redirect zu login');
    window.location.href = '/login';
  }
}
```

---

## 🔗 Rate Limiting

Bisher nicht implementiert. TODO für Production:
- Login: max 5 Versuche pro Minute
- API: max 100 Requests pro Minute pro User

---

**API Dokumentation v1.0 | ABI-2029**
