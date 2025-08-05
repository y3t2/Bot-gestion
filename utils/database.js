const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/bot.db');
        this.db = null;
        this.init();
    }

    init() {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Erreur lors de l\'ouverture de la base de données:', err);
            } else {
                console.log('✅ Base de données SQLite connectée');
                this.createTables();
            }
        });
    }

    createTables() {
        // Table pour la blacklist
        this.db.run(`
            CREATE TABLE IF NOT EXISTS blacklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                guild_id TEXT,
                reason TEXT DEFAULT 'Aucune raison spécifiée',
                added_by TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table blacklist:', err);
            } else {
                console.log('✅ Table blacklist créée/vérifiée');
            }
        });

        // Table pour la whitelist
        this.db.run(`
            CREATE TABLE IF NOT EXISTS whitelist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                guild_id TEXT,
                added_by TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table whitelist:', err);
            } else {
                console.log('✅ Table whitelist créée/vérifiée');
            }
        });

        // Table pour les owners
        this.db.run(`
            CREATE TABLE IF NOT EXISTS owners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                added_by TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table owners:', err);
            } else {
                console.log('✅ Table owners créée/vérifiée');
            }
        });

        // Table pour la configuration des salons de bienvenue
        this.db.run(`
            CREATE TABLE IF NOT EXISTS welcome_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT UNIQUE NOT NULL,
                channel_id TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table welcome_config:', err);
            } else {
                console.log('✅ Table welcome_config créée/vérifiée');
            }
        });

        // Table pour la configuration des salons de départ
        this.db.run(`
            CREATE TABLE IF NOT EXISTS leave_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT UNIQUE NOT NULL,
                channel_id TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table leave_config:', err);
            } else {
                console.log('✅ Table leave_config créée/vérifiée');
            }
        });
    }

    // Méthodes pour la blacklist
    isBlacklisted(userId, guildId = null) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM blacklist WHERE user_id = ?';
            let params = [userId];

            if (guildId) {
                query += ' OR guild_id = ?';
                params.push(guildId);
            }

            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    addToBlacklist(userId, guildId = null, reason = 'Aucune raison spécifiée', addedBy) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO blacklist (user_id, guild_id, reason, added_by) VALUES (?, ?, ?, ?)',
                [userId, guildId, reason, addedBy],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    removeFromBlacklist(userId, guildId = null) {
        return new Promise((resolve, reject) => {
            let query = 'DELETE FROM blacklist WHERE user_id = ?';
            let params = [userId];

            if (guildId) {
                query += ' OR guild_id = ?';
                params.push(guildId);
            }

            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    getBlacklist() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM blacklist ORDER BY added_at DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Méthodes pour la whitelist
    isWhitelisted(userId, guildId = null) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM whitelist WHERE user_id = ?';
            let params = [userId];

            if (guildId) {
                query += ' OR guild_id = ?';
                params.push(guildId);
            }

            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    addToWhitelist(userId, guildId = null, addedBy) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO whitelist (user_id, guild_id, added_by) VALUES (?, ?, ?)',
                [userId, guildId, addedBy],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    removeFromWhitelist(userId, guildId = null) {
        return new Promise((resolve, reject) => {
            let query = 'DELETE FROM whitelist WHERE user_id = ?';
            let params = [userId];

            if (guildId) {
                query += ' OR guild_id = ?';
                params.push(guildId);
            }

            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    getWhitelist() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM whitelist ORDER BY added_at DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Méthodes pour les owners
    isOwner(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM owners WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    addOwner(userId, addedBy) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO owners (user_id, added_by) VALUES (?, ?)',
                [userId, addedBy],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    removeOwner(userId) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM owners WHERE user_id = ?', [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    getOwners() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM owners ORDER BY added_at DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Méthodes utilitaires
    getStats() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    (SELECT COUNT(*) FROM blacklist) as blacklist_count,
                    (SELECT COUNT(*) FROM whitelist) as whitelist_count,
                    (SELECT COUNT(*) FROM owners) as owners_count
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    // Méthodes pour la configuration des salons de bienvenue
    getWelcomeConfig(guildId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM welcome_config WHERE guild_id = ? AND enabled = 1', [guildId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    setWelcomeConfig(guildId, channelId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO welcome_config (guild_id, channel_id, enabled) VALUES (?, ?, 1)',
                [guildId, channelId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    disableWelcomeConfig(guildId) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE welcome_config SET enabled = 0 WHERE guild_id = ?', [guildId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Méthodes pour la configuration des salons de départ
    getLeaveConfig(guildId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM leave_config WHERE guild_id = ? AND enabled = 1', [guildId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    setLeaveConfig(guildId, channelId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO leave_config (guild_id, channel_id, enabled) VALUES (?, ?, 1)',
                [guildId, channelId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    disableLeaveConfig(guildId) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE leave_config SET enabled = 0 WHERE guild_id = ?', [guildId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Erreur lors de la fermeture de la base de données:', err);
                } else {
                    console.log('✅ Base de données fermée');
                }
            });
        }
    }
}

module.exports = new Database(); 