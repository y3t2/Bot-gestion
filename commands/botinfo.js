const { EmbedBuilder, version } = require('discord.js');
const config = require('../config.json');
const os = require('os');

module.exports = {
    name: 'botinfo',
    aliases: ['bi', 'bot'],
    description: 'Affiche les informations du bot',
    usage: 'botinfo',
    category: 'Informations',
    async execute(message, args, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const uptimeString = `${days}j ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🤖 Informations du Bot')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '📛 Nom', value: client.user.tag, inline: true },
                { name: '🆔 ID', value: client.user.id, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '⏰ Uptime', value: uptimeString, inline: true },
                { name: '🏓 Latence', value: `${client.ws.ping}ms`, inline: true },
                { name: '📊 Version Discord.js', value: version, inline: true },
                { name: '🖥️ OS', value: `${os.type()} ${os.release()}`, inline: true },
                { name: '💾 Mémoire', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '📈 CPU', value: `${os.cpus()[0].model}`, inline: true }
            )
            .addFields(
                { name: '🏠 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
                { name: '💬 Canaux', value: `${client.channels.cache.size}`, inline: true },
                { name: '🎭 Rôles', value: `${client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0)}`, inline: true },
                { name: '😀 Emojis', value: `${client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0)}`, inline: true },
                { name: '🔧 Préfixe', value: config.prefix, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 