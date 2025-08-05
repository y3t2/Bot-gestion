const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'booster',
    aliases: ['boosters', 'nitro'],
    description: 'Affiche les boosters du serveur',
    usage: 'booster',
    category: 'Informations',
    async execute(message, args, client) {
        const guild = message.guild;
        
        // Récupérer le rôle booster
        const boosterRole = guild.roles.cache.find(role => role.tags?.premiumSubscriberRole);
        
        if (!boosterRole) {
            return message.reply('❌ Ce serveur n\'a pas de boosters ou de rôle booster configuré.');
        }

        const boosters = boosterRole.members;
        
        if (boosters.size === 0) {
            return message.reply('❌ Aucun booster trouvé sur ce serveur.');
        }

        // Trier les boosters par date de boost (si possible)
        const sortedBoosters = boosters.sort((a, b) => {
            const aJoined = a.joinedTimestamp;
            const bJoined = b.joinedTimestamp;
            return aJoined - bJoined;
        });

        const boosterList = sortedBoosters.map(member => {
            const status = member.presence?.status || 'offline';
            const statusEmoji = {
                'online': '🟢',
                'idle': '🟡',
                'dnd': '🔴',
                'offline': '⚫'
            }[status] || '⚫';

            return `${statusEmoji} **${member.user.tag}**\n   └ Boosté depuis <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
        });

        const embed = new EmbedBuilder()
            .setColor('#ff73fa') // Couleur Nitro
            .setTitle(`🚀 Boosters de ${guild.name}`)
            .setDescription(boosterList.join('\n\n'))
            .addFields(
                { name: '📊 Statistiques', value: `Total: ${boosters.size} booster(s)`, inline: true },
                { name: '🎯 Niveau de boost', value: `${guild.premiumTier}/3`, inline: true },
                { name: '💎 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(guild.iconURL({ dynamic: true }));

        // Ajouter des informations sur les avantages du niveau actuel
        const tierBenefits = {
            0: 'Aucun avantage',
            1: 'Emojis personnalisés, qualité audio 128kbps',
            2: 'Emojis personnalisés, qualité audio 256kbps, bannière de serveur',
            3: 'Emojis personnalisés, qualité audio 384kbps, bannière de serveur, invite personnalisée'
        };

        embed.addFields({
            name: '🎁 Avantages du niveau actuel',
            value: tierBenefits[guild.premiumTier] || 'Inconnu',
            inline: false
        });

        message.reply({ embeds: [embed] });
    }
}; 