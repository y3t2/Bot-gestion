const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'snipe',
    aliases: ['s'],
    description: 'Affiche le dernier message supprimé',
    usage: 'snipe',
    category: 'Utilitaires',
    permissions: [PermissionFlagsBits.ManageMessages],
    async execute(message, args, client) {
        const snipedMessage = client.snipedMessages.get(message.guild.id);

        if (!snipedMessage) {
            return message.reply('❌ Aucun message supprimé récemment dans ce serveur !');
        }

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🔍 Dernier Message Supprimé')
            .setDescription(`**Contenu:** ${snipedMessage.content || '*Aucun contenu textuel*'}`)
            .addFields(
                { 
                    name: '👤 Auteur', 
                    value: `${snipedMessage.author} (${snipedMessage.author.tag})`, 
                    inline: true 
                },
                { 
                    name: '📺 Canal', 
                    value: `${snipedMessage.channel}`, 
                    inline: true 
                },
                { 
                    name: '⏰ Supprimé le', 
                    value: `<t:${Math.floor(snipedMessage.timestamp / 1000)}:F>`, 
                    inline: true 
                }
            )
            .setThumbnail(snipedMessage.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

        // Ajouter les pièces jointes s'il y en a
        if (snipedMessage.attachments && snipedMessage.attachments.length > 0) {
            const attachmentList = snipedMessage.attachments.map(att => `• ${att.name} (${att.url})`).join('\n');
            embed.addFields({
                name: '📎 Pièces jointes',
                value: attachmentList,
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
}; 