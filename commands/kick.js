const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const Logger = require('../utils/logger');

module.exports = {
    name: 'kick',
    aliases: ['expulser'],
    description: 'Expulse un utilisateur du serveur',
    usage: 'kick <@utilisateur> [raison]',
    category: 'Modération',
    permissions: [PermissionFlagsBits.KickMembers],
    async execute(message, args, client) {
        const logger = new Logger(client);
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à expulser !');
        }

        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        if (member.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous expulser vous-même !');
        }

        if (member.id === client.user.id) {
            return message.reply('❌ Je ne peux pas m\'expulser moi-même !');
        }

        if (!member.kickable) {
            return message.reply('❌ Je ne peux pas expulser cet utilisateur !');
        }

        try {
            await member.kick(reason);
            
            // Logger l'action de modération
            await logger.logModeration(message.guild, 'Kick', message.author, user, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('👢 Utilisateur expulsé')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Expulsé par', value: `${message.author.tag}`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur s\'est produite lors de l\'expulsion !');
        }
    }
}; 