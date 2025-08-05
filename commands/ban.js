const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const Logger = require('../utils/logger');

module.exports = {
    name: 'ban',
    aliases: ['bannir'],
    description: 'Bannit un utilisateur du serveur',
    usage: 'ban <@utilisateur> [raison]',
    category: 'Modération',
    permissions: [PermissionFlagsBits.BanMembers],
    async execute(message, args, client) {
        const logger = new Logger(client);
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à bannir !');
        }

        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        if (member.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous bannir vous-même !');
        }

        if (member.id === client.user.id) {
            return message.reply('❌ Je ne peux pas me bannir moi-même !');
        }

        if (!member.bannable) {
            return message.reply('❌ Je ne peux pas bannir cet utilisateur !');
        }

        try {
            await member.ban({ reason: reason });
            
            // Logger l'action de modération
            await logger.logModeration(message.guild, 'Ban', message.author, user, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff4757')
                .setTitle('🔨 Utilisateur banni')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Banni par', value: `${message.author.tag}`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur s\'est produite lors du bannissement !');
        }
    }
}; 