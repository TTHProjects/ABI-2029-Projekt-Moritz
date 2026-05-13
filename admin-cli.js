/**
 * admin-cli.js - Command-Line Tool für Admin-Aufgaben
 * Verwendet für lokale Datenverwaltung und Debugging
 */

const fs = require('fs');
require('dotenv').config();
const DatabaseEncryption = require('./encryption');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || './db/database.json';
const encryption = new DatabaseEncryption(process.env.DB_ENCRYPTION_KEY);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadDatabase() {
  try {
    return encryption.readEncryptedFile(dbPath);
  } catch (error) {
    console.error('❌ Fehler beim Laden der Datenbank:', error.message);
    process.exit(1);
  }
}

function saveDatabase(data) {
  try {
    encryption.writeEncryptedFile(dbPath, data);
    console.log('✅ Datenbank gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// COMMANDS
// ============================================================================

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'add-user':
    {
      const email = args[0];
      const name = args[1];
      const password = args[2];
      const role = args[3] || 'user';

      if (!email || !password) {
        console.log('Usage: node admin-cli.js add-user <email> <name> <password> [role]');
        process.exit(1);
      }

      const db = loadDatabase();
      const passwordHash = bcrypt.hashSync(password, 10);

      const newUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: name,
        passwordHash: passwordHash,
        role: role,
        approved: false,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDatabase(db);
      console.log(`✅ User erstellt: ${email} (${role})`);
    }
    break;

  case 'list-users':
    {
      const db = loadDatabase();
      if (db.users.length === 0) {
        console.log('Keine User gefunden');
        process.exit(0);
      }

      console.log('\n👥 Registrierte User:');
      console.log('==================');
      db.users.forEach((user, i) => {
        console.log(`\n${i + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Approved: ${user.approved ? '✅' : '❌'}`);
        console.log(`   Erstellt: ${new Date(user.createdAt).toLocaleDateString('de-DE')}`);
      });
      console.log('\n');
    }
    break;

  case 'approve-user':
    {
      const email = args[0];
      if (!email) {
        console.log('Usage: node admin-cli.js approve-user <email>');
        process.exit(1);
      }

      const db = loadDatabase();
      const user = db.users.find(u => u.email === email);

      if (!user) {
        console.log(`❌ User nicht gefunden: ${email}`);
        process.exit(1);
      }

      user.approved = true;
      saveDatabase(db);
      console.log(`✅ User freigegeben: ${email}`);
    }
    break;

  case 'delete-user':
    {
      const email = args[0];
      if (!email) {
        console.log('Usage: node admin-cli.js delete-user <email>');
        process.exit(1);
      }

      const db = loadDatabase();
      const index = db.users.findIndex(u => u.email === email);

      if (index === -1) {
        console.log(`❌ User nicht gefunden: ${email}`);
        process.exit(1);
      }

      const deleted = db.users[index];
      db.users.splice(index, 1);
      saveDatabase(db);
      console.log(`✅ User gelöscht: ${deleted.name}`);
    }
    break;

  case 'reset-database':
    {
      if (args[0] !== '--force') {
        console.log('⚠️  Dies löscht ALLE Daten!');
        console.log('Usage: node admin-cli.js reset-database --force');
        process.exit(1);
      }

      const db = {
        users: [],
        events: [],
        payments: [],
        news: []
      };

      saveDatabase(db);
      console.log('✅ Datenbank zurückgesetzt (alle Daten gelöscht)');
    }
    break;

  case 'show-database':
    {
      const db = loadDatabase();
      console.log('\n📊 Datenbank-Übersicht:');
      console.log('=======================');
      console.log(`Users: ${db.users.length}`);
      console.log(`Events: ${db.events.length}`);
      console.log(`Payments: ${db.payments.length}`);
      console.log(`News: ${db.news.length}`);
      console.log('\n');
    }
    break;

  case 'help':
  default:
    {
      console.log(`
🛠️  ABI-2029 Admin CLI

Commands:
  add-user <email> <name> <password> [role]  - Neuen User hinzufügen
  list-users                                  - Alle User anzeigen
  approve-user <email>                        - User freigeben
  delete-user <email>                         - User löschen
  show-database                               - DB-Statistik anzeigen
  reset-database --force                      - Datenbank zurücksetzen
  help                                        - Diese Hilfe anzeigen

Examples:
  node admin-cli.js add-user max@example.com "Max Mustermann" password123 user
  node admin-cli.js approve-user max@example.com
  node admin-cli.js list-users
      `);
    }
}
