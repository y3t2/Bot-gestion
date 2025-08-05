const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'say',
    aliases: ['dire', 'parler'],
    description: 'Fait parler le bot avec un message personnalisé',
    usage: 'say <message>',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageMessages],
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply('❌ Veuillez spécifier un message à dire !');
        }

        const text = args.join(' ');
        
        // Supprimer la commande originale
        await message.delete().catch(() => {});

        // Vérifier si le message contient une mention de rôle
        if (text.includes('@everyone') || text.includes('@here')) {
            if (!message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
                return message.channel.send('❌ Vous n\'avez pas les permissions pour mentionner @everyone ou @here !');
            }
        }

        // Vérifier si c'est un embed
        if (text.startsWith('embed:')) {
            const embedText = text.slice(6); // Enlever "embed:"
            
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription(embedText)
                .setTimestamp()
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.channel.send({ embeds: [embed] });
        } else {
            // Message normal
            message.channel.send(text);
        }
    }
}; 