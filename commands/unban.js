const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const Logger = require('../utils/logger');

module.exports = {
    name: 'unban',
    aliases: ['deban'],
    description: 'Débannit un utilisateur du serveur',
    usage: 'unban <ID_utilisateur>',
    category: 'Modération',
    permissions: [PermissionFlagsBits.BanMembers],
    async execute(message, args, client) {
        const logger = new Logger(client);
        const userId = args[0];

        if (!userId) {
            return message.reply('❌ Veuillez fournir l\'ID de l\'utilisateur à débannir !');
        }

        if (!/^\d+$/.test(userId)) {
            return message.reply('❌ Veuillez fournir un ID valide !');
        }

        try {
            const bans = await message.guild.bans.fetch();
            const bannedUser = bans.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return message.reply('❌ Cet utilisateur n\'est pas banni de ce serveur !');
            }

            await message.guild.members.unban(userId);
            
            // Logger l'action de modération
            await logger.logModeration(message.guild, 'Unban', message.author, bannedUser.user, 'Utilisateur débanni');

            const embed = new EmbedBuilder()
                .setColor('#2ed573')
                .setTitle('🔓 Utilisateur débanni')
                .addFields(
                    { name: 'Utilisateur', value: `${bannedUser.user.tag} (${userId})`, inline: true },
                    { name: 'Débanni par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(bannedUser.user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur s\'est produite lors du débannissement !');
        }
    }
}; 