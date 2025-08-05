const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'userinfo',
    aliases: ['user', 'ui'],
    description: 'Affiche les informations d\'un utilisateur',
    usage: 'userinfo [@utilisateur]',
    category: 'Informations',
    execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(`👤 Informations sur ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '📥 A rejoint le', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'N/A', inline: true },
                { name: '🎭 Rôles', value: member ? member.roles.cache.map(role => role.toString()).join(', ') : 'N/A', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        if (member) {
            const roles = member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .sort((a, b) => b.position - a.position);

            embed.addFields(
                { name: '🎨 Couleur', value: member.displayHexColor, inline: true },
                { name: '📊 Rôle le plus haut', value: roles.first() ? roles.first().toString() : 'Aucun rôle', inline: true },
                { name: '🔊 Peut parler', value: member.voice.channel ? 'Oui' : 'Non', inline: true }
            );
        }

        message.reply({ embeds: [embed] });
    }
}; 