const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'unlock',
    aliases: ['déverrouiller'],
    description: 'Déverrouille un canal',
    usage: 'unlock [canal]',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageChannels],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Canal déverrouillé')
                .addFields(
                    { name: 'Canal', value: `${channel}`, inline: true },
                    { name: 'Action', value: 'Déverrouillé', inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors du déverrouillage:', error);
            message.reply('❌ Une erreur s\'est produite lors du déverrouillage du canal !');
        }
    }
}; 