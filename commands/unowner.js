const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');

module.exports = {
    name: 'unowner',
    aliases: ['removeowner'],
    description: 'Retire un propriétaire du bot',
    usage: 'unowner @utilisateur',
    category: 'Système',
    ownerOnly: true,
    async execute(message, args, client) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à retirer des owners !');
        }

        if (user.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous retirer vous-même des owners !');
        }

        const isOwner = await listManager.isOwner(user.id);
        if (!isOwner) {
            return message.reply('❌ Cet utilisateur n\'est pas owner !');
        }

        const result = await listManager.removeOwner(user.id);
        if (result) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Propriétaire retiré')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Retiré par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Une erreur s\'est produite lors du retrait de l\'owner !');
        }
    }
}; 