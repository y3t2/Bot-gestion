const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'vc',
    aliases: ['voice', 'voicechannels', 'stats'],
    description: 'Affiche les statistiques du serveur',
    usage: 'vc',
    category: 'Informations',
    async execute(message, args, client) {
        const guild = message.guild;
        
        // Récupérer les statistiques des membres
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
        const streamingMembers = guild.members.cache.filter(member => 
            member.presence?.activities?.some(activity => activity.type === 1) // STREAMING
        ).size;
        const voiceMembers = guild.members.cache.filter(member => 
            member.voice.channel
        ).size;

        // Récupérer les informations de boost
        const boostCount = guild.premiumSubscriptionCount || 0;
        const boostLevel = guild.premiumTier;

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('📊 STATS DU SERVEUR')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { 
                    name: '👥 Membres', 
                    value: `En ligne: ${onlineMembers}\nEn stream: ${streamingMembers}\nEn vocal: ${voiceMembers}\nActifs: ${totalMembers}`, 
                    inline: false 
                },
                { 
                    name: '💎 Boosts', 
                    value: `${boostCount}`, 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 