/**
 * server.js - ABI-2029 Website Hauptserver
 * SHADOW-JSON: Hochsichere, autarke Abitur-Verwaltungsplattform
 * 
 * Features:
 * - Root Admin Authentication (Hardcoded via .env)
 * - User Authentication (JSON-basiert)
 * - AES-256-GCM Datenverschlüsselung
 * - Session Management
 * - RBAC (Role-Based Access Control)
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const DatabaseEncryption = require('./encryption');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. MIDDLEWARE CONFIGURATION
// ============================================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Management
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
  }
}));

// ============================================================================
// 2. DATABASE INITIALIZATION
// ============================================================================

const fs = require('fs');
const dbPath = process.env.DB_PATH || './db/database.json';
let database = {};

// Initialisiere Datenbank (verschlüsselt im Ruhezustand)
try {
  const encryption = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);
  
  if (fs.existsSync(dbPath)) {
    database = encryption.readEncryptedFile(dbPath);
    console.log('✓ Verschlüsselte Datenbank geladen');
  } else {
    // Initialisiere mit leeren Strukturen
    database = {
      users: [],
      events: [],
      payments: [],
      news: []
    };
    encryption.writeEncryptedFile(dbPath, database);
    console.log('✓ Neue Datenbank erstellt');
  }
} catch (error) {
  console.error('❌ Fehler beim Laden der Datenbank:', error.message);
  process.exit(1);
}

// ============================================================================
// 3. HELPER FUNCTIONS
// ============================================================================

/**
 * Speichert die Datenbank verschlüsselt
 */
function saveDatabase() {
  try {
    const encryption = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);
    encryption.writeEncryptedFile(dbPath, database);
    console.log('✓ Datenbank gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Datenbank:', error.message);
  }
}

/**
 * Middleware: Überprüfe ob User authentifiziert ist
 */
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

/**
 * Middleware: Überprüfe Admin-Status
 */
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Zugriff verweigert' });
}

/**
 * Middleware: Überprüfe Root-Admin-Status
 */
function isRootAdmin(req, res, next) {
  if (req.session.user && req.session.user.isRootAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Root Admin Zugriff erforderlich' });
}

// ============================================================================
// 4. AUTHENTICATION ROUTES
// ============================================================================

/**
 * GET /login - Login-Seite
 */
app.get('/login', (req, res) => {
  res.render('index', {
    page: 'login',
    user: req.session.user || null
  });
});

/**
 * POST /login - Login-Verarbeitung
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Root Admin Check
  if (email === process.env.ROOT_ADMIN_EMAIL) {
    const passwordHash = process.env.ROOT_ADMIN_PASSWORD_HASH;
    
    if (bcrypt.compareSync(password, passwordHash)) {
      req.session.user = {
        id: 'root-admin',
        email: email,
        name: 'Root Administrator',
        role: 'admin',
        isRootAdmin: true,
        createdAt: new Date().toISOString()
      };
      console.log(`✓ Root Admin angemeldet: ${email}`);
      return res.redirect('/dashboard');
    }
  }

  // Regular User Check
  const user = database.users.find(u => u.email === email);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    if (!user.approved) {
      return res.render('index', {
        page: 'login',
        error: 'Ihr Konto wurde noch nicht freigegeben.',
        user: null
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isRootAdmin: false,
      createdAt: user.createdAt
    };
    console.log(`✓ User angemeldet: ${email}`);
    return res.redirect('/dashboard');
  }

  res.render('index', {
    page: 'login',
    error: 'Email oder Passwort falsch.',
    user: null
  });
});

/**
 * GET /logout - Abmelden
 */
app.get('/logout', (req, res) => {
  const email = req.session.user?.email;
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    console.log(`✓ User abgemeldet: ${email}`);
    res.redirect('/login');
  });
});

// ============================================================================
// 5. MAIN ROUTES
// ============================================================================

/**
 * GET / - Redirect zur Dashboard oder Login
 */
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

/**
 * GET /dashboard - Hauptdashboard
 */
app.get('/dashboard', isAuthenticated, (req, res) => {
  const user = req.session.user;
  
  // Lade User-Daten für Dashboard
  let userData = {
    ...user,
    abikassaStatus: {
      bezahlt: user.isRootAdmin ? 0 : Math.random() * 500,
      offen: user.isRootAdmin ? 0 : Math.random() * 200
    },
    events: database.events.slice(0, 5),
    news: database.news.slice(0, 3)
  };

  res.render('index', {
    page: 'dashboard',
    user: userData
  });
});

/**
 * GET /admin - Admin-Panel
 */
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.render('index', {
    page: 'admin',
    user: req.session.user,
    stats: {
      userCount: database.users.length,
      eventCount: database.events.length,
      totalPayments: 0
    }
  });
});

/**
 * GET /api/profile - Aktuellas User-Profil
 */
app.get('/api/profile', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

// ============================================================================
// 6. ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('❌ Fehler:', err.message);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

app.use((req, res) => {
  res.status(404).render('index', {
    page: '404',
    user: req.session.user || null
  });
});

// ============================================================================
// 7. SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        ABI-2029 Website - SHADOW-JSON Server          ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Server läuft auf http://localhost:${PORT}${' '.repeat(32 - PORT.toString().length)}║`);
  console.log(`║  📁 Datenbank: ${dbPath}${' '.repeat(30 - dbPath.length)}║`);
  console.log(`║  🔐 Verschlüsselung: AES-256-GCM${' '.repeat(25)}║`);
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Login mit Root Admin:');
  console.log(`  Email: ${process.env.ROOT_ADMIN_EMAIL}`);
  console.log('  Passwort: (siehe .env)');
  console.log('');
});

module.exports = app;
