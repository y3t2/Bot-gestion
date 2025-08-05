const database = require('./database');

class ListManager {
    constructor() {
        this.db = database;
    }

    // Blacklist methods
    async isBlacklisted(userId, guildId = null) {
        try {
            return await this.db.isBlacklisted(userId, guildId);
        } catch (error) {
            console.error('Erreur lors de la vérification de la blacklist:', error);
            return false;
        }
    }

    async addToBlacklist(userId, guildId = null, reason = 'Aucune raison spécifiée', addedBy) {
        try {
            return await this.db.addToBlacklist(userId, guildId, reason, addedBy);
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la blacklist:', error);
            return false;
        }
    }

    async removeFromBlacklist(userId, guildId = null) {
        try {
            return await this.db.removeFromBlacklist(userId, guildId);
        } catch (error) {
            console.error('Erreur lors du retrait de la blacklist:', error);
            return false;
        }
    }

    async getBlacklist() {
        try {
            return await this.db.getBlacklist();
        } catch (error) {
            console.error('Erreur lors de la récupération de la blacklist:', error);
            return [];
        }
    }

    // Whitelist methods
    async isWhitelisted(userId, guildId = null) {
        try {
            return await this.db.isWhitelisted(userId, guildId);
        } catch (error) {
            console.error('Erreur lors de la vérification de la whitelist:', error);
            return false;
        }
    }

    async addToWhitelist(userId, guildId = null, addedBy) {
        try {
            return await this.db.addToWhitelist(userId, guildId, addedBy);
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la whitelist:', error);
            return false;
        }
    }

    async removeFromWhitelist(userId, guildId = null) {
        try {
            return await this.db.removeFromWhitelist(userId, guildId);
        } catch (error) {
            console.error('Erreur lors du retrait de la whitelist:', error);
            return false;
        }
    }

    async getWhitelist() {
        try {
            return await this.db.getWhitelist();
        } catch (error) {
            console.error('Erreur lors de la récupération de la whitelist:', error);
            return [];
        }
    }

    // Owner methods
    async isOwner(userId) {
        try {
            return await this.db.isOwner(userId);
        } catch (error) {
            console.error('Erreur lors de la vérification des owners:', error);
            return false;
        }
    }

    async addOwner(userId, addedBy) {
        try {
            return await this.db.addOwner(userId, addedBy);
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'un owner:', error);
            return false;
        }
    }

    async removeOwner(userId) {
        try {
            return await this.db.removeOwner(userId);
        } catch (error) {
            console.error('Erreur lors du retrait d\'un owner:', error);
            return false;
        }
    }

    async getOwners() {
        try {
            return await this.db.getOwners();
        } catch (error) {
            console.error('Erreur lors de la récupération des owners:', error);
            return [];
        }
    }

    // Méthodes utilitaires
    async getStats() {
        try {
            return await this.db.getStats();
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return { blacklist_count: 0, whitelist_count: 0, owners_count: 0 };
        }
    }

    // Méthode pour migrer les anciens fichiers JSON vers SQLite
    async migrateFromJSON() {
        const fs = require('fs');
        const path = require('path');
        
        try {
            // Migration de la blacklist
            const blacklistPath = path.join(__dirname, '../data/blacklist.json');
            if (fs.existsSync(blacklistPath)) {
                const blacklistData = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));
                for (const userId of blacklistData.users || []) {
                    await this.addToBlacklist(userId, null, 'Migration depuis JSON', 'SYSTEM');
                }
                console.log('✅ Migration de la blacklist terminée');
            }

            // Migration de la whitelist
            const whitelistPath = path.join(__dirname, '../data/whitelist.json');
            if (fs.existsSync(whitelistPath)) {
                const whitelistData = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
                for (const userId of whitelistData.users || []) {
                    await this.addToWhitelist(userId, null, 'SYSTEM');
                }
                console.log('✅ Migration de la whitelist terminée');
            }

            // Migration des owners
            const ownersPath = path.join(__dirname, '../data/owners.json');
            if (fs.existsSync(ownersPath)) {
                const ownersData = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));
                for (const userId of ownersData.users || []) {
                    await this.addOwner(userId, 'SYSTEM');
                }
                console.log('✅ Migration des owners terminée');
            }
        } catch (error) {
            console.error('Erreur lors de la migration:', error);
        }
    }
}

module.exports = new ListManager(); 