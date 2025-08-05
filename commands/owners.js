const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');

module.exports = {
    name: 'owners',
    aliases: ['listowners', 'ownerlist'],
    description: 'Affiche la liste des propriétaires du bot',
    usage: 'owners',
    category: 'Système',
    ownerOnly: true,
    async execute(message, args, client) {
        const owners = await listManager.getOwners();
        
        if (owners.length === 0) {
            return message.reply('👑 Aucun propriétaire supplémentaire configuré.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('👑 Liste des propriétaires')
            .setDescription(owners.map(entry => 
                `<@${entry.user_id}> (${entry.user_id})`
            ).join('\n'))
            .setTimestamp()
            .setFooter({ text: `Total: ${owners.length} propriétaire(s) | © Powered by y3t2`, iconURL: client.user.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 