const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const antiLink = require('../utils/antilink');

module.exports = {
    name: 'antilink',
    aliases: ['al', 'antihere', 'antieveryone'],
    description: 'Gère le système d\'antilink, antihere et antieveryone',
    usage: 'antilink <type> <on/off/status/action/whitelist> [paramètres]',
    category: 'Administration',
    permissions: [PermissionFlagsBits.ManageMessages],
    async execute(message, args, client) {
        if (!args.length) {
            return this.showHelp(message);
        }

        const type = args[0].toLowerCase();
        const action = args[1]?.toLowerCase();

        switch (type) {
            case 'link':
            case 'antilink':
                await this.handleAntilink(message, action, args.slice(2));
                break;
            case 'here':
            case 'antihere':
                await this.handleAntihere(message, action, args.slice(2));
                break;
            case 'everyone':
            case 'antieveryone':
                await this.handleAntieveryone(message, action, args.slice(2));
                break;
            case 'status':
                await this.showStatus(message);
                break;
            case 'action':
                await this.setAction(message, action);
                break;
            case 'whitelist':
                await this.handleWhitelist(message, action, args.slice(2));
                break;
            default:
                message.reply('❌ Type invalide. Utilisez: `link`, `here`, `everyone`, `status`, `action`, `whitelist`');
        }
    },

    async handleAntilink(message, action, params) {
        const guildId = message.guild.id;

        switch (action) {
            case 'on':
                antiLink.setProtection(guildId, 'antilink', true);
                await this.sendSuccess(message, 'Antilink activé');
                break;
            case 'off':
                antiLink.setProtection(guildId, 'antilink', false);
                await this.sendSuccess(message, 'Antilink désactivé');
                break;
            default:
                message.reply('❌ Action invalide. Utilisez: `on` ou `off`');
        }
    },

    async handleAntihere(message, action, params) {
        const guildId = message.guild.id;

        switch (action) {
            case 'on':
                antiLink.setProtection(guildId, 'antihere', true);
                await this.sendSuccess(message, 'Antihere activé');
                break;
            case 'off':
                antiLink.setProtection(guildId, 'antihere', false);
                await this.sendSuccess(message, 'Antihere désactivé');
                break;
            default:
                message.reply('❌ Action invalide. Utilisez: `on` ou `off`');
        }
    },

    async handleAntieveryone(message, action, params) {
        const guildId = message.guild.id;

        switch (action) {
            case 'on':
                antiLink.setProtection(guildId, 'antieveryone', true);
                await this.sendSuccess(message, 'Antieveryone activé');
                break;
            case 'off':
                antiLink.setProtection(guildId, 'antieveryone', false);
                await this.sendSuccess(message, 'Antieveryone désactivé');
                break;
            default:
                message.reply('❌ Action invalide. Utilisez: `on` ou `off`');
        }
    },

    async setAction(message, action) {
        const guildId = message.guild.id;
        const validActions = ['delete', 'warn', 'kick', 'ban'];

        if (!validActions.includes(action)) {
            return message.reply(`❌ Action invalide. Utilisez: ${validActions.join(', ')}`);
        }

        antiLink.setAction(guildId, action);
        await this.sendSuccess(message, `Action définie sur: ${action}`);
    },

    async handleWhitelist(message, action, params) {
        const guildId = message.guild.id;

        switch (action) {
            case 'channel':
            case 'channels':
                await this.handleChannelWhitelist(message, params);
                break;
            case 'role':
            case 'roles':
                await this.handleRoleWhitelist(message, params);
                break;
            case 'user':
            case 'users':
                await this.handleUserWhitelist(message, params);
                break;
            case 'list':
                await this.showWhitelist(message);
                break;
            default:
                message.reply('❌ Type de whitelist invalide. Utilisez: `channel`, `role`, `user`, `list`');
        }
    },

    async handleChannelWhitelist(message, params) {
        const guildId = message.guild.id;
        const subAction = params[0]?.toLowerCase();
        const channelMention = params[1];

        if (!subAction || !channelMention) {
            return message.reply('❌ Usage: `antilink whitelist channel <add/remove> #canal`');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('❌ Canal invalide. Mentionnez un canal avec #');
        }

        const add = subAction === 'add';
        antiLink.toggleWhitelist(guildId, 'Channels', channel.id, add);
        
        await this.sendSuccess(message, `Canal ${add ? 'ajouté à' : 'retiré de'} la whitelist: ${channel.name}`);
    },

    async handleRoleWhitelist(message, params) {
        const guildId = message.guild.id;
        const subAction = params[0]?.toLowerCase();
        const roleMention = params[1];

        if (!subAction || !roleMention) {
            return message.reply('❌ Usage: `antilink whitelist role <add/remove> @rôle`');
        }

        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('❌ Rôle invalide. Mentionnez un rôle avec @');
        }

        const add = subAction === 'add';
        antiLink.toggleWhitelist(guildId, 'Roles', role.id, add);
        
        await this.sendSuccess(message, `Rôle ${add ? 'ajouté à' : 'retiré de'} la whitelist: ${role.name}`);
    },

    async handleUserWhitelist(message, params) {
        const guildId = message.guild.id;
        const subAction = params[0]?.toLowerCase();
        const userMention = params[1];

        if (!subAction || !userMention) {
            return message.reply('❌ Usage: `antilink whitelist user <add/remove> @utilisateur`');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Utilisateur invalide. Mentionnez un utilisateur avec @');
        }

        const add = subAction === 'add';
        antiLink.toggleWhitelist(guildId, 'Users', user.id, add);
        
        await this.sendSuccess(message, `Utilisateur ${add ? 'ajouté à' : 'retiré de'} la whitelist: ${user.tag}`);
    },

    async showWhitelist(message) {
        const guildId = message.guild.id;
        const settings = antiLink.getSettings(guildId);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('📋 Whitelist Anti-Protection')
            .addFields(
                { 
                    name: '📺 Canaux Whitelistés', 
                    value: settings.whitelistChannels.length > 0 
                        ? settings.whitelistChannels.map(id => `<#${id}>`).join(', ')
                        : 'Aucun canal whitelisté',
                    inline: false 
                },
                { 
                    name: '🎭 Rôles Whitelistés', 
                    value: settings.whitelistRoles.length > 0 
                        ? settings.whitelistRoles.map(id => `<@&${id}>`).join(', ')
                        : 'Aucun rôle whitelisté',
                    inline: false 
                },
                { 
                    name: '👤 Utilisateurs Whitelistés', 
                    value: settings.whitelistUsers.length > 0 
                        ? settings.whitelistUsers.map(id => `<@${id}>`).join(', ')
                        : 'Aucun utilisateur whitelisté',
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async showStatus(message) {
        const guildId = message.guild.id;
        const stats = antiLink.getStats(guildId);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🛡️ Statut Anti-Protection')
            .addFields(
                { 
                    name: '🔗 Antilink', 
                    value: stats.antilink ? '✅ Activé' : '❌ Désactivé', 
                    inline: true 
                },
                { 
                    name: '📍 Antihere', 
                    value: stats.antihere ? '✅ Activé' : '❌ Désactivé', 
                    inline: true 
                },
                { 
                    name: '👥 Antieveryone', 
                    value: stats.antieveryone ? '✅ Activé' : '❌ Désactivé', 
                    inline: true 
                },
                { 
                    name: '⚡ Action', 
                    value: this.getActionText(stats.action), 
                    inline: true 
                },
                { 
                    name: '📋 Whitelist', 
                    value: `Canaux: ${stats.whitelistChannels}\nRôles: ${stats.whitelistRoles}\nUtilisateurs: ${stats.whitelistUsers}`, 
                    inline: true 
                }
            )
            .addFields(
                { 
                    name: '💡 Actions disponibles', 
                    value: '• `delete` - Supprimer le message\n• `warn` - Avertir l\'utilisateur\n• `kick` - Expulser l\'utilisateur\n• `ban` - Bannir l\'utilisateur', 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async showHelp(message) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🛡️ Aide Anti-Protection')
            .setDescription('Système de protection contre les liens, @here et @everyone')
            .addFields(
                { 
                    name: '🔗 Antilink', 
                    value: '`antilink link on/off` - Activer/désactiver la protection des liens', 
                    inline: false 
                },
                { 
                    name: '📍 Antihere', 
                    value: '`antilink here on/off` - Activer/désactiver la protection @here', 
                    inline: false 
                },
                { 
                    name: '👥 Antieveryone', 
                    value: '`antilink everyone on/off` - Activer/désactiver la protection @everyone', 
                    inline: false 
                },
                { 
                    name: '⚡ Action', 
                    value: '`antilink action <delete/warn/kick/ban>` - Définir l\'action', 
                    inline: false 
                },
                { 
                    name: '📋 Whitelist', 
                    value: '`antilink whitelist <channel/role/user> <add/remove> @mention`', 
                    inline: false 
                },
                { 
                    name: '📊 Statut', 
                    value: '`antilink status` - Voir le statut complet', 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async sendSuccess(message, text) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Succès')
            .setDescription(text)
            .setTimestamp()
            .setFooter({ text: `Par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    getActionText(action) {
        const actions = {
            'delete': '🗑️ Suppression du message',
            'warn': '⚠️ Avertissement',
            'kick': '👢 Expulsion',
            'ban': '🔨 Bannissement'
        };
        return actions[action] || '🗑️ Suppression du message';
    }
}; 