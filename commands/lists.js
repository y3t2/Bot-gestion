const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');

module.exports = {
    name: 'lists',
    aliases: ['status'],
    description: 'Affiche le statut des listes (blacklist, whitelist, owners)',
    usage: 'lists',
    category: 'Administration',
    ownerOnly: true,
    async execute(message, args, client) {
        const [blacklist, whitelist, owners, stats] = await Promise.all([
            listManager.getBlacklist(),
            listManager.getWhitelist(),
            listManager.getOwners(),
            listManager.getStats()
        ]);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('📋 Statut des listes')
            .addFields(
                { 
                    name: '🚫 Blacklist', 
                    value: blacklist.length > 0 
                        ? blacklist.map(entry => `<@${entry.user_id}>`).join(', ')
                        : 'Aucun utilisateur blacklisté',
                    inline: false 
                },
                { 
                    name: '✅ Whitelist', 
                    value: whitelist.length > 0 
                        ? whitelist.map(entry => `<@${entry.user_id}>`).join(', ')
                        : 'Aucun utilisateur whitelisté',
                    inline: false 
                },
                { 
                    name: '👑 Propriétaires', 
                    value: owners.length > 0 
                        ? owners.map(entry => `<@${entry.user_id}>`).join(', ')
                        : 'Aucun propriétaire supplémentaire',
                    inline: false 
                }
            )
            .addFields(
                { 
                    name: '📊 Statistiques', 
                    value: `Blacklist: ${stats.blacklist_count}\nWhitelist: ${stats.whitelist_count}\nOwners: ${stats.owners_count}`, 
                    inline: true 
                },
                { 
                    name: '🔧 Configuration', 
                    value: `Préfixe: ${config.prefix}\nOwner principal: <@${config.ownerID}>`, 
                    inline: true 
                }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 