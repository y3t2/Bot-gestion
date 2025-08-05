const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'lock',
    aliases: ['verrouiller'],
    description: 'Verrouille ou déverrouille un canal',
    usage: 'lock [canal]',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageChannels],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        if (!channel.permissionsFor(message.guild.roles.everyone).has(PermissionFlagsBits.SendMessages)) {
            // Le canal est verrouillé, le déverrouiller
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
        } else {
            // Le canal est déverrouillé, le verrouiller
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔒 Canal verrouillé')
                .addFields(
                    { name: 'Canal', value: `${channel}`, inline: true },
                    { name: 'Action', value: 'Verrouillé', inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        }
    }
}; 