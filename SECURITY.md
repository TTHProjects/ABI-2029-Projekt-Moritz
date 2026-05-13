# 🔐 SECURITY GUIDE - ABI-2029

Sicherheits- und Datenschutz-Dokumentation für das ABI-2029 Website-Projekt.

## 🎯 Sicherheits-Philosophie

Diese Anwendung ist als **hochsicheres, autonomes System** konzipiert:
- ✅ Keine Abhängigkeit von externen Services
- ✅ Verschlüsselung aller sensiblen Daten
- ✅ Strikte Zugriffskontrolle (RBAC)
- ✅ Bcrypt Passwort-Hashing
- ✅ Session Management mit HttpOnly Cookies

---

## 🔑 Kryptographie

### AES-256-GCM Verschlüsselung

**Wo wird verschlüsselt?**
- Datenbank-Dateien (`db/database.json`) im Ruhezustand
- Alle User, Events, Payments, News werden verschlüsselt gespeichert

**Wie funktioniert es?**
```
Daten → AES-256-GCM → Base64 → Datei
Datei → Base64 → AES-256-GCM → Daten
```

**Komponenten:**
- **Key**: DB_ENCRYPTION_KEY (32 Bytes = 64 Hex-Zeichen)
- **IV** (Initialization Vector): 16 Bytes, zufällig pro Verschlüsselung
- **AuthTag**: 16 Bytes, für Authentizität & Integrität
- **Ciphertext**: Die verschlüsselten Daten

**Details:**
- Algorithmus: AES-256-GCM
- Mode: Galois/Counter Mode (garantiert Authentizität)
- IV-Länge: 128 Bits (16 Bytes)
- Tag-Länge: 128 Bits (16 Bytes)

### Passwort-Hashing

**Algoritmus**: Bcrypt (mit 10 Rounds)

```javascript
// Root Admin
ROOT_ADMIN_PASSWORD_HASH = bcrypt.hashSync(password, 10);

// Regular User
user.passwordHash = bcrypt.hashSync(password, 10);
```

**Sicher vor:**
- ✅ Rainbow Tables (Salting)
- ✅ Brute Force (hoher Computational Cost)
- ✅ Plaintext Exposure

---

## 👥 Authentication & Authorization

### Root Admin
- **Authentifizierung**: Email + Password (Bcrypt Check)
- **Speicherung**: .env Datei (nicht in DB)
- **Zugriff**: Absolute Kontrolle
- **Hardcoding**: Absichtlich! Sehr sicher via Umgebungsvariablen

### Regular User
- **Authentifizierung**: Email + Password
- **Speicherung**: Verschlüsselte JSON-DB
- **Freigabe**: Manuell durch Admin (kein SMTP-Auto-Confirm)
- **Approval-Flow**: Admin muss Konto explizit `approved` setzen

### Session Management
```
Login → Set HttpOnly Cookie
Cookie → Express-Session → req.session.user
Logout → Destroy Session
```

**Cookie-Optionen:**
```javascript
{
  secure: true,           // Nur über HTTPS (in Production)
  httpOnly: true,         // Nicht über JavaScript zugänglich
  sameSite: 'strict',     // Vor CSRF schützen
  maxAge: 24*60*60*1000   // 24 Stunden
}
```

### Role-Based Access Control (RBAC)

| Rolle | Berechtigungen |
|-------|---|
| **root-admin** | Alles (absolute Kontrolle) |
| **admin** | User-Verwaltung, Freigaben |
| **kasse** | Zahlungen, Konten |
| **planung** | Events, News |
| **user** | Dashboard, Events sehen |

**Implementierung:**
```javascript
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Zugriff verweigert' });
}
```

---

## 🔒 Schlüsselverwaltung

### DB_ENCRYPTION_KEY
- **Länge**: 32 Bytes (64 Hex-Zeichen)
- **Speicherung**: `.env` Datei
- **Generierung**: `crypto.randomBytes(32).toString('hex')`
- **Backup**: KRITISCH! Verlust = Datenverlust
- **Rotation**: Bisher nicht implementiert (TODO)

### SESSION_SECRET
- **Länge**: 32 Bytes (64 Hex-Zeichen)
- **Zweck**: Express-Session Signing
- **Speicherung**: `.env` Datei
- **Generierung**: `crypto.randomBytes(32).toString('hex')`

### ROOT_ADMIN_PASSWORD_HASH
- **Algorithmus**: Bcrypt (10 Rounds)
- **Speicherung**: `.env` Datei
- **Backup**: Muss separat verwahrt werden
- **Reset**: setup.sh nochmal ausführen oder manuell .env ändern

---

## 🚨 Bekannte Sicherheits-Annahmen

1. **Lokales System**: Annahme: Nur berechtigte Personen haben Zugriff auf den Server/die Datei
2. **Keine Rotation**: Encryption Keys werden nicht rotiert (TODO)
3. **Synchrone Verschlüsselung**: Datenbank liegt im RAM während Ausführung (möglich: On-the-fly verschlüsseln)
4. **Kein HTTPS-Erzwingung**: Wird nicht auf HTTP 302-Redirect erzwungen (muss auf Reverse-Proxy setzen)
5. **No 2FA**: Zweifaktor-Authentifizierung nicht implementiert (TODO)
6. **No Audit Log**: Wer hat was wann gelöscht? Nicht geloggt (TODO)

---

## ✅ Best Practices

### 1. Umgebungsvariablen

**Richtig:**
```bash
# .env (NICHT committen!)
ROOT_ADMIN_PASSWORD_HASH=$2a$10$...
DB_ENCRYPTION_KEY=...
```

**Falsch:**
```bash
# Hardcoded in Code
const password = "admin123";
```

### 2. Passwort-Anforderungen

Für Root Admin bei Setup mindestens:
- 12+ Zeichen
- Mix aus Groß/Kleinbuchstaben
- Zahlen
- Spezialzeichen

### 3. Deployment

**Sicher:**
1. Docker Container mit read-only Filesystem für Code
2. .env via Secrets Management (AWS Secrets, HashiCorp Vault)
3. HTTPS mit starkem SSL/TLS (TLS 1.3+)
4. Regelmäßige Security Audits

**Nicht sicher:**
- .env in Git committen
- Passwords in Logs schreiben
- HTTP (unverschlüsselt)
- Standard-Ports freilegen

### 4. Datenschutz

Diese Anwendung speichert:
- ✅ Email-Adressen (gehashed in Session, plaintext für Kommunikation)
- ✅ Zahlungsinformationen (Beträge, Status)
- ✅ Event-Teilnahmen

**DSGVO Hinweise:**
- Nutzer müssen zustimmen, dass Daten gespeichert werden
- Recht auf Löschung: `node admin-cli.js delete-user <email>`
- Recht auf Auskunft: `node admin-cli.js list-users`

---

## 🛡️ Sicherheits-Checkliste für Production

- [ ] NODE_ENV=production setzen
- [ ] HTTPS aktivieren (SSL/TLS 1.3+)
- [ ] .env sicher verwahren (nicht in Git!)
- [ ] DB_ENCRYPTION_KEY backed up
- [ ] ROOT_ADMIN_PASSWORD_HASH backed up
- [ ] Firewall: Nur Port 80/443 öffnen
- [ ] Regelmäßige Database Backups (verschlüsselt!)
- [ ] Log-Rotation aktiviert
- [ ] npm audit regelmäßig durchführen
- [ ] Security Headers setzen (später: Helmet.js)
- [ ] Rate Limiting aktivieren (später)
- [ ] 2FA für Root Admin (TODO)

---

## 🔍 Sicherheits-Audit

### Code-Review Punkte
1. Alle Input validiert? (XSS-Schutz)
2. SQL-Injection möglich? (nicht zutreffend, JSON-DB)
3. CSRF-Tokens? (Token implementiert: via SameSite Cookie)
4. Fehlerbehandlung sicher? (Keine sensitiven Stack Traces)
5. API-Endpoints geschützt? (isAuthenticated Middleware)

### Regelmäßige Checks
```bash
# Vulnerabilities scannen
npm audit

# Abhängigkeiten updaten
npm update

# Sicherheits-Tests laufen
npm test  # (noch nicht implementiert)
```

---

## 📞 Security Incidents

Falls ein Sicherheitsproblem gefunden wird:

1. **Sofort tun:**
   - Server offline nehmen
   - Backups sichern
   - .env sichern

2. **Analysieren:**
   - Was wurde kompromittiert?
   - Wann ist es passiert?
   - Wer hat Zugriff?

3. **Reagieren:**
   - Neue Keys generieren
   - Neue Passwörter setzen
   - Logs überprüfen

4. **Kommunizieren:**
   - Betroffene Benutzer informieren
   - DSGVO-Meldung prüfen

---

## 📚 Ressourcen

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [AES-256-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

---

**Sicherheit ist ein Prozess, kein Ziel. Ständig verbessern! 🔐**
