require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const DatabaseEncryption = require('./encryption');

const app = express();
const PORT = process.env.PORT || 4011;

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
    secure: false, // false für Codespace/HTTP; in Production hinter HTTPS-Proxy auf true
    httpOnly: true,
    sameSite: 'lax',
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

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('index', { page: 'login', user: null, error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('index', { page: 'login', user: null, error: 'Email und Passwort erforderlich.' });
  }

  // Root Admin Check
  if (email === process.env.ROOT_ADMIN_EMAIL) {
    if (bcrypt.compareSync(password, process.env.ROOT_ADMIN_PASSWORD_HASH)) {
      req.session.user = { id: 'root-admin', email, name: 'Root Administrator', role: 'admin', isRootAdmin: true };
      return res.redirect('/dashboard');
    }
  }

  // Regular User Check
  const user = database.users.find(u => u.email === email);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    if (!user.approved) {
      return res.render('index', { page: 'login', user: null, error: 'Konto noch nicht freigegeben. Wende dich an einen Admin.' });
    }
    req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role, isRootAdmin: false };
    return res.redirect('/dashboard');
  }

  res.render('index', { page: 'login', user: null, error: 'Email oder Passwort falsch.' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ============================================================================
// 5. MAIN ROUTES
// ============================================================================

app.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));

app.get('/dashboard', isAuthenticated, (req, res) => {
  const u = req.session.user;
  let paymentInfo = { bezahlt: 0, offen: 0 };
  if (!u.isRootAdmin) {
    const userPayments = database.payments.filter(p => p.userId === u.id);
    paymentInfo.bezahlt = userPayments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
    paymentInfo.offen   = userPayments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);
  }
  res.render('index', {
    page: 'dashboard',
    user: u,
    events: database.events.slice(0, 5),
    news: database.news.slice(0, 4),
    paymentInfo
  });
});

// ============================================================================
// 6. ADMIN ROUTES
// ============================================================================

function canAdmin(req, res, next) {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.isRootAdmin)) return next();
  res.status(403).render('index', { page: '403', user: req.session.user });
}
function canKasse(req, res, next) {
  const r = req.session.user ? req.session.user.role : null;
  if (req.session.user && (req.session.user.isRootAdmin || r === 'admin' || r === 'kasse')) return next();
  res.status(403).render('index', { page: '403', user: req.session.user });
}
function canPlanung(req, res, next) {
  const r = req.session.user ? req.session.user.role : null;
  if (req.session.user && (req.session.user.isRootAdmin || r === 'admin' || r === 'planung')) return next();
  res.status(403).render('index', { page: '403', user: req.session.user });
}

// --- User-Verwaltung ---
app.get('/admin/users', isAuthenticated, canAdmin, (req, res) => {
  res.render('index', {
    page: 'admin-users',
    user: req.session.user,
    users: database.users,
    flash: req.session.flash || null
  });
  req.session.flash = null;
});

app.post('/admin/users/add', isAuthenticated, canAdmin, (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    req.session.flash = { type: 'error', msg: 'Alle Felder erforderlich.' };
    return res.redirect('/admin/users');
  }
  if (database.users.find(u => u.email === email)) {
    req.session.flash = { type: 'error', msg: 'Email bereits vorhanden.' };
    return res.redirect('/admin/users');
  }
  const newUser = {
    id: 'user_' + crypto.randomBytes(6).toString('hex'),
    name, email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'user',
    approved: false,
    createdAt: new Date().toISOString()
  };
  database.users.push(newUser);
  saveDatabase();
  req.session.flash = { type: 'success', msg: `User "${name}" angelegt.` };
  res.redirect('/admin/users');
});

app.post('/admin/users/:id/approve', isAuthenticated, canAdmin, (req, res) => {
  const u = database.users.find(u => u.id === req.params.id);
  if (u) { u.approved = true; saveDatabase(); }
  req.session.flash = { type: 'success', msg: `User freigegeben.` };
  res.redirect('/admin/users');
});

app.post('/admin/users/:id/role', isAuthenticated, canAdmin, (req, res) => {
  const u = database.users.find(u => u.id === req.params.id);
  if (u && req.body.role) { u.role = req.body.role; saveDatabase(); }
  req.session.flash = { type: 'success', msg: `Rolle aktualisiert.` };
  res.redirect('/admin/users');
});

app.post('/admin/users/:id/delete', isAuthenticated, canAdmin, (req, res) => {
  database.users = database.users.filter(u => u.id !== req.params.id);
  saveDatabase();
  req.session.flash = { type: 'success', msg: `User gelöscht.` };
  res.redirect('/admin/users');
});

// --- Kasse ---
app.get('/admin/kasse', isAuthenticated, canKasse, (req, res) => {
  const usersWithPayments = database.users.map(u => ({
    ...u,
    payments: database.payments.filter(p => p.userId === u.id),
    totalBezahlt: database.payments.filter(p => p.userId === u.id && p.paid).reduce((s, p) => s + p.amount, 0),
    totalOffen:   database.payments.filter(p => p.userId === u.id && !p.paid).reduce((s, p) => s + p.amount, 0)
  }));
  const gesamtBezahlt = database.payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const gesamtOffen   = database.payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);
  res.render('index', {
    page: 'admin-kasse',
    user: req.session.user,
    usersWithPayments,
    gesamtBezahlt,
    gesamtOffen,
    flash: req.session.flash || null
  });
  req.session.flash = null;
});

app.post('/admin/kasse/add', isAuthenticated, canKasse, (req, res) => {
  const { userId, amount, description, paid } = req.body;
  if (!userId || !amount) {
    req.session.flash = { type: 'error', msg: 'User und Betrag erforderlich.' };
    return res.redirect('/admin/kasse');
  }
  const payment = {
    id: 'pay_' + crypto.randomBytes(6).toString('hex'),
    userId,
    amount: parseFloat(amount),
    description: description || '',
    paid: paid === 'true',
    date: new Date().toISOString(),
    addedBy: req.session.user.id
  };
  database.payments.push(payment);
  saveDatabase();
  req.session.flash = { type: 'success', msg: `Zahlung über ${amount}€ hinzugefügt.` };
  res.redirect('/admin/kasse');
});

app.post('/admin/kasse/:id/toggle', isAuthenticated, canKasse, (req, res) => {
  const p = database.payments.find(p => p.id === req.params.id);
  if (p) { p.paid = !p.paid; saveDatabase(); }
  res.redirect('/admin/kasse');
});

app.post('/admin/kasse/:id/delete', isAuthenticated, canKasse, (req, res) => {
  database.payments = database.payments.filter(p => p.id !== req.params.id);
  saveDatabase();
  res.redirect('/admin/kasse');
});

// --- Events ---
app.get('/admin/events', isAuthenticated, canPlanung, (req, res) => {
  res.render('index', {
    page: 'admin-events',
    user: req.session.user,
    events: database.events,
    flash: req.session.flash || null
  });
  req.session.flash = null;
});

app.post('/admin/events/add', isAuthenticated, canPlanung, (req, res) => {
  const { title, date, description, location } = req.body;
  if (!title || !date) {
    req.session.flash = { type: 'error', msg: 'Titel und Datum erforderlich.' };
    return res.redirect('/admin/events');
  }
  database.events.push({
    id: 'evt_' + crypto.randomBytes(6).toString('hex'),
    title, date, description: description || '', location: location || '',
    createdBy: req.session.user.id,
    createdAt: new Date().toISOString()
  });
  database.events.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveDatabase();
  req.session.flash = { type: 'success', msg: `Event "${title}" erstellt.` };
  res.redirect('/admin/events');
});

app.post('/admin/events/:id/delete', isAuthenticated, canPlanung, (req, res) => {
  database.events = database.events.filter(e => e.id !== req.params.id);
  saveDatabase();
  req.session.flash = { type: 'success', msg: `Event gelöscht.` };
  res.redirect('/admin/events');
});

// --- News ---
app.get('/admin/news', isAuthenticated, canPlanung, (req, res) => {
  res.render('index', {
    page: 'admin-news',
    user: req.session.user,
    newsList: database.news,
    flash: req.session.flash || null
  });
  req.session.flash = null;
});

app.post('/admin/news/add', isAuthenticated, canPlanung, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    req.session.flash = { type: 'error', msg: 'Titel und Inhalt erforderlich.' };
    return res.redirect('/admin/news');
  }
  database.news.unshift({
    id: 'news_' + crypto.randomBytes(6).toString('hex'),
    title, content,
    createdBy: req.session.user.name || req.session.user.email,
    createdAt: new Date().toISOString()
  });
  saveDatabase();
  req.session.flash = { type: 'success', msg: `News "${title}" veröffentlicht.` };
  res.redirect('/admin/news');
});

app.post('/admin/news/:id/delete', isAuthenticated, canPlanung, (req, res) => {
  database.news = database.news.filter(n => n.id !== req.params.id);
  saveDatabase();
  res.redirect('/admin/news');
});

// ============================================================================
// 7. ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('❌ Fehler:', err.message);
  res.status(500).render('index', { page: '404', user: req.session.user || null });
});

app.use((req, res) => {
  res.status(404).render('index', { page: '404', user: req.session.user || null });
});

// ============================================================================
// 8. SERVER START
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        ABI-2029 Website - SHADOW-JSON Server          ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 http://localhost:${PORT}                               ║`);
  console.log(`║  🔐 Verschlüsselung: AES-256-GCM                      ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Root Admin: ${process.env.ROOT_ADMIN_EMAIL}`);
  console.log('');
});

module.exports = app;
