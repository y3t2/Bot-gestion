const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');
const Logger = require('../utils/logger');

module.exports = {
    name: 'blacklist',
    aliases: ['bl'],
    description: 'Gère la liste noire des utilisateurs',
    usage: 'blacklist <add/remove/list> [@utilisateur] [raison]',
    category: 'Administration',
    ownerOnly: true,
    async execute(message, args, client) {
        const logger = new Logger(client);
        
        if (!args.length) {
            return message.reply('❌ Veuillez spécifier une action: `add`, `remove` ou `list`');
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'add':
                await this.addToBlacklist(message, args.slice(1), logger);
                break;
            case 'remove':
                await this.removeFromBlacklist(message, args.slice(1), logger);
                break;
            case 'list':
                await this.showBlacklist(message);
                break;
            default:
                message.reply('❌ Action invalide. Utilisez `add`, `remove` ou `list`');
        }
    },

    async addToBlacklist(message, args, logger) {
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à ajouter à la blacklist !');
        }

        if (user.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous blacklist vous-même !');
        }

        if (user.id === client.user.id) {
            return message.reply('❌ Je ne peux pas me blacklist moi-même !');
        }

        const isBlacklisted = await listManager.isBlacklisted(user.id);
        if (isBlacklisted) {
            return message.reply('❌ Cet utilisateur est déjà dans la blacklist !');
        }

        // Ajouter à la blacklist
        const result = await listManager.addToBlacklist(user.id, message.guild.id, reason, message.author.id);
        if (result) {
            // Logger l'action
            await logger.logListAction(message.guild, 'Ajouté à la Blacklist', user, message.author, 'blacklist');

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Utilisateur blacklisté')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Blacklisté par', value: `${message.author.tag}`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });

            // Bannir automatiquement de tous les serveurs où le bot est présent
            client.guilds.cache.forEach(guild => {
                const member = guild.members.cache.get(user.id);
                if (member && member.bannable) {
                    member.ban({ reason: `Blacklist automatique: ${reason}` })
                        .catch(error => console.error(`Erreur lors du bannissement de ${user.tag} sur ${guild.name}:`, error));
                }
            });
        } else {
            message.reply('❌ Une erreur s\'est produite lors de l\'ajout à la blacklist !');
        }
    },

    async removeFromBlacklist(message, args, logger) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à retirer de la blacklist !');
        }

        const isBlacklisted = await listManager.isBlacklisted(user.id);
        if (!isBlacklisted) {
            return message.reply('❌ Cet utilisateur n\'est pas dans la blacklist !');
        }

        const result = await listManager.removeFromBlacklist(user.id, message.guild.id);
        if (result) {
            // Logger l'action
            await logger.logListAction(message.guild, 'Retiré de la Blacklist', user, message.author, 'blacklist');

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Utilisateur retiré de la blacklist')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Retiré par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Une erreur s\'est produite lors du retrait de la blacklist !');
        }
    },

    async showBlacklist(message) {
        const blacklist = await listManager.getBlacklist();
        
        if (blacklist.length === 0) {
            return message.reply('📋 La blacklist est vide.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🚫 Liste des utilisateurs blacklistés')
            .setDescription(blacklist.map(entry => 
                `<@${entry.user_id}> (${entry.user_id}) - Raison: ${entry.reason}`
            ).join('\n'))
            .setTimestamp()
            .setFooter({ text: `Total: ${blacklist.length} utilisateur(s)`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 