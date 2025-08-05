const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'serverinfo',
    aliases: ['server', 'si'],
    description: 'Affiche les informations du serveur',
    usage: 'serverinfo',
    category: 'Informations',
    execute(message, args, client) {
        const guild = message.guild;
        const owner = guild.members.cache.get(guild.ownerId);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(`🏠 Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🆔 ID du serveur', value: guild.id, inline: true },
                { name: '👑 Propriétaire', value: owner ? owner.user.tag : 'Inconnu', inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Canaux', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🔒 Niveau de vérification', value: `${guild.verificationLevel}`, inline: true },
                { name: '📊 Nombre de boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        if (guild.description) {
            embed.setDescription(guild.description);
        }

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ dynamic: true }));
        }

        message.reply({ embeds: [embed] });
    }
}; 