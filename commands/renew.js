const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'renew',
    aliases: ['recréer'],
    description: 'Recrée un canal en supprimant tous les messages',
    usage: 'renew [canal]',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageChannels],
    async execute(message, args, client) {
        const channel = message.mentions.channels.first() || message.channel;
        
        if (!channel.permissionsFor(message.member).has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas les permissions pour recréer ce canal !');
        }

        try {
            // Sauvegarder les propriétés du canal
            const channelName = channel.name;
            const channelType = channel.type;
            const channelPosition = channel.position;
            const channelParent = channel.parent;
            const channelTopic = channel.topic;
            const channelNSFW = channel.nsfw;
            const channelRateLimit = channel.rateLimitPerUser;
            const channelPermissions = channel.permissionOverwrites.cache;

            // Supprimer l'ancien canal
            await channel.delete();

            // Créer le nouveau canal
            const newChannel = await message.guild.channels.create({
                name: channelName,
                type: channelType,
                parent: channelParent,
                topic: channelTopic,
                nsfw: channelNSFW,
                rateLimitPerUser: channelRateLimit,
                position: channelPosition,
                permissionOverwrites: channelPermissions
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔄 Canal recréé')
                .addFields(
                    { name: 'Canal', value: `${newChannel}`, inline: true },
                    { name: 'Action', value: 'Recréé avec succès', inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            // Envoyer le message dans le nouveau canal
            await newChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la recréation du canal:', error);
            message.reply('❌ Une erreur s\'est produite lors de la recréation du canal !');
        }
    }
}; 