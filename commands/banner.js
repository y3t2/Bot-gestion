const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'banner',
    aliases: ['bannière'],
    description: 'Affiche la bannière du serveur',
    usage: 'banner',
    category: 'Informations',
    async execute(message, args, client) {
        const guild = message.guild;
        
        try {
            // Récupérer les informations complètes du serveur
            const fullGuild = await guild.fetch();
            
            if (!fullGuild.banner) {
                return message.reply('❌ Ce serveur n\'a pas de bannière.');
            }

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(`🖼️ Bannière de ${guild.name}`)
                .setImage(fullGuild.bannerURL({ size: 1024, dynamic: true }))
                .addFields(
                    { name: '📏 Format', value: fullGuild.banner.startsWith('a_') ? 'GIF' : 'PNG/JPG', inline: true },
                    { name: '🔗 URL', value: `[Cliquer ici](${fullGuild.bannerURL({ size: 1024, dynamic: true })})`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la récupération de la bannière:', error);
            message.reply('❌ Une erreur s\'est produite lors de la récupération de la bannière !');
        }
    }
}; 