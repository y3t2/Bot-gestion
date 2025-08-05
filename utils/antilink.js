const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class AntiLink {
    constructor() {
        this.settings = new Map(); // Stockage des paramètres par serveur
        this.whitelistedChannels = new Map(); // Canaux whitelistés par serveur
        this.whitelistedRoles = new Map(); // Rôles whitelistés par serveur
        this.whitelistedUsers = new Map(); // Utilisateurs whitelistés par serveur
    }

    // Initialiser les paramètres pour un serveur
    initGuild(guildId) {
        if (!this.settings.has(guildId)) {
            this.settings.set(guildId, {
                antilink: false,
                antihere: false,
                antieveryone: false,
                action: 'delete', // 'delete', 'warn', 'kick', 'ban'
                whitelistChannels: [],
                whitelistRoles: [],
                whitelistUsers: []
            });
        }
    }

    // Activer/Désactiver les protections
    setProtection(guildId, type, enabled) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        settings[type] = enabled;
        this.settings.set(guildId, settings);
    }

    // Définir l'action à effectuer
    setAction(guildId, action) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        settings.action = action;
        this.settings.set(guildId, settings);
    }

    // Ajouter/Retirer des éléments de la whitelist
    toggleWhitelist(guildId, type, itemId, add = true) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        
        if (add) {
            if (!settings[`whitelist${type}`].includes(itemId)) {
                settings[`whitelist${type}`].push(itemId);
            }
        } else {
            settings[`whitelist${type}`] = settings[`whitelist${type}`].filter(id => id !== itemId);
        }
        
        this.settings.set(guildId, settings);
    }

    // Vérifier si un message contient des liens
    containsLinks(content) {
        const linkPatterns = [
            /https?:\/\/[^\s]+/g, // URLs HTTP/HTTPS
            /discord\.gg\/[^\s]+/g, // Invites Discord
            /discord\.com\/invite\/[^\s]+/g, // Invites Discord (nouveau format)
            /www\.[^\s]+/g, // Sites web
            /[^\s]+\.[a-z]{2,}/g // Domaines génériques
        ];

        return linkPatterns.some(pattern => pattern.test(content));
    }

    // Vérifier si un message contient @here ou @everyone
    containsMentions(content) {
        return content.includes('@here') || content.includes('@everyone');
    }

    // Vérifier si un utilisateur est whitelisté
    isWhitelisted(guildId, member) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        
        // Vérifier les permissions d'administration
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return true;
        }

        // Vérifier les rôles whitelistés
        const hasWhitelistedRole = member.roles.cache.some(role => 
            settings.whitelistRoles.includes(role.id)
        );
        if (hasWhitelistedRole) return true;

        // Vérifier l'utilisateur whitelisté
        if (settings.whitelistUsers.includes(member.id)) {
            return true;
        }

        return false;
    }

    // Vérifier si un canal est whitelisté
    isChannelWhitelisted(guildId, channelId) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        return settings.whitelistChannels.includes(channelId);
    }

    // Traiter un message
    async processMessage(message, client) {
        const guildId = message.guild.id;
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);

        // Ignorer les bots
        if (message.author.bot) return false;

        // Vérifier si l'utilisateur est whitelisté
        if (this.isWhitelisted(guildId, message.member)) {
            return false;
        }

        // Vérifier si le canal est whitelisté
        if (this.isChannelWhitelisted(guildId, message.channel.id)) {
            return false;
        }

        let violation = null;
        let violationType = '';

        // Vérifier les liens
        if (settings.antilink && this.containsLinks(message.content)) {
            violation = 'Lien détecté';
            violationType = 'antilink';
        }

        // Vérifier @here et @everyone
        if ((settings.antihere || settings.antieveryone) && this.containsMentions(message.content)) {
            if (message.content.includes('@here') && settings.antihere) {
                violation = 'Mention @here détectée';
                violationType = 'antihere';
            } else if (message.content.includes('@everyone') && settings.antieveryone) {
                violation = 'Mention @everyone détectée';
                violationType = 'antieveryone';
            }
        }

        if (violation) {
            await this.handleViolation(message, violation, violationType, settings.action, client);
            return true;
        }

        return false;
    }

    // Gérer une violation
    async handleViolation(message, violation, violationType, action, client) {
        try {
            // Supprimer le message
            await message.delete();

            // Créer l'embed d'alerte
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Violation Détectée')
                .addFields(
                    { name: 'Utilisateur', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Canal', value: `${message.channel}`, inline: true },
                    { name: 'Type', value: violation, inline: true },
                    { name: 'Action', value: this.getActionText(action), inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: 'Système Anti-Protection', iconURL: client.user.displayAvatarURL() });

            // Envoyer l'alerte
            await this.sendAlert(message.guild, embed, client);

            // Effectuer l'action appropriée
            await this.performAction(message, action, violation, client);

        } catch (error) {
            console.error('Erreur lors de la gestion de la violation:', error);
        }
    }

    // Effectuer l'action appropriée
    async performAction(message, action, violation, client) {
        const member = message.member;
        
        try {
            switch (action) {
                case 'warn':
                    // Envoyer un avertissement privé
                    try {
                        const warnEmbed = new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ Avertissement')
                            .setDescription(`Votre message a été supprimé car il contenait: **${violation}**`)
                            .addFields(
                                { name: 'Serveur', value: message.guild.name, inline: true },
                                { name: 'Canal', value: message.channel.name, inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Système Anti-Protection', iconURL: client.user.displayAvatarURL() });

                        await message.author.send({ embeds: [warnEmbed] });
                    } catch (dmError) {
                        // Impossible d'envoyer un DM
                    }
                    break;

                case 'kick':
                    if (member.kickable) {
                        await member.kick(`Anti-Protection: ${violation}`);
                    }
                    break;

                case 'ban':
                    if (member.bannable) {
                        await member.ban({ reason: `Anti-Protection: ${violation}` });
                    }
                    break;

                default:
                    // Action par défaut: juste supprimer le message
                    break;
            }
        } catch (error) {
            console.error('Erreur lors de l\'exécution de l\'action:', error);
        }
    }

    // Envoyer une alerte
    async sendAlert(guild, embed, client) {
        try {
            // Trouver un canal de logs
            const logChannel = guild.channels.cache.find(channel => 
                channel.name.includes('log') || 
                channel.name.includes('admin') || 
                channel.name.includes('mod') ||
                channel.name.includes('antilink')
            );

            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'alerte:', error);
        }
    }

    // Obtenir le texte de l'action
    getActionText(action) {
        const actions = {
            'delete': 'Suppression du message',
            'warn': 'Avertissement',
            'kick': 'Expulsion',
            'ban': 'Bannissement'
        };
        return actions[action] || 'Suppression du message';
    }

    // Obtenir les paramètres d'un serveur
    getSettings(guildId) {
        this.initGuild(guildId);
        return this.settings.get(guildId);
    }

    // Obtenir les statistiques
    getStats(guildId) {
        this.initGuild(guildId);
        const settings = this.settings.get(guildId);
        return {
            antilink: settings.antilink,
            antihere: settings.antihere,
            antieveryone: settings.antieveryone,
            action: settings.action,
            whitelistChannels: settings.whitelistChannels.length,
            whitelistRoles: settings.whitelistRoles.length,
            whitelistUsers: settings.whitelistUsers.length
        };
    }
}

module.exports = new AntiLink(); 