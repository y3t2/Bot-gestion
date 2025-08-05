const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'ownerbot',
    aliases: ['owner', 'creator', 'dev'],
    description: 'Affiche les informations sur l\'owner du bot',
    usage: 'ownerbot',
    category: 'Informations',
    async execute(message, args, client) {
        try {
            // Récupérer les informations de l'owner
            const owner = await client.users.fetch(config.ownerID);
            
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('👑 Informations sur l\'Owner')
                .setThumbnail(owner.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '👤 Nom', value: owner.tag, inline: true },
                    { name: '🆔 ID', value: owner.id, inline: true },
                    { name: '📅 Compte créé', value: `<t:${Math.floor(owner.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '🤖 Bot créé', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '📊 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true }
                )
                .addFields(
                    { 
                        name: '💬 Contact', 
                        value: 'Pour toute question ou suggestion, n\'hésitez pas à me contacter !', 
                        inline: false 
                    },
                    { 
                        name: '🔗 Liens', 
                        value: 'Serveur officiel du bot\nSupport et assistance', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la récupération des informations owner:', error);
            message.reply('❌ Une erreur s\'est produite lors de la récupération des informations sur l\'owner.');
        }
    }
}; 