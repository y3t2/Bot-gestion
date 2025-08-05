const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'ping',
    aliases: ['latency'],
    description: 'Affiche la latence du bot',
    usage: 'ping',
    category: 'Utilitaire',
    execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latence du Bot', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: 'Latence de l\'API', value: `\`${Date.now() - message.createdTimestamp}ms\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 