const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');

module.exports = {
    name: 'owner',
    aliases: ['addowner'],
    description: 'Ajoute un propriétaire au bot',
    usage: 'owner @utilisateur',
    category: 'Système',
    ownerOnly: true,
    async execute(message, args, client) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à ajouter comme owner !');
        }

        if (user.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous ajouter vous-même comme owner !');
        }

        if (user.id === client.user.id) {
            return message.reply('❌ Je ne peux pas être owner de moi-même !');
        }

        const isOwner = await listManager.isOwner(user.id);
        if (isOwner) {
            return message.reply('❌ Cet utilisateur est déjà owner !');
        }

        const result = await listManager.addOwner(user.id, message.author.id);
        if (result) {
            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('👑 Nouveau propriétaire ajouté')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Ajouté par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Une erreur s\'est produite lors de l\'ajout de l\'owner !');
        }
    }
}; 