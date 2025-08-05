const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'join',
    aliases: ['rejoindre'],
    description: 'Rejoint le salon vocal d\'un utilisateur',
    usage: 'join @utilisateur',
    category: 'Vocales',
    permissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers],
    async execute(message, args, client) {
        const user = message.mentions.users.first();
        
        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur avec `@utilisateur`');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Utilisateur non trouvé sur ce serveur');
        }

        if (!member.voice.channel) {
            return message.reply('❌ Cet utilisateur n\'est pas dans un salon vocal');
        }

        const voiceChannel = member.voice.channel;
        
        try {
            // Vérifier si le bot peut rejoindre le salon
            if (!voiceChannel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.Connect)) {
                return message.reply('❌ Je n\'ai pas la permission de rejoindre ce salon vocal');
            }

            // Rejoindre le salon vocal
            await voiceChannel.join();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Salon Vocal Rejoint')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag}`, inline: true },
                    { name: 'Salon', value: `${voiceChannel.name}`, inline: true },
                    { name: 'Action', value: 'Rejoint', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la connexion au salon vocal:', error);
            message.reply('❌ Une erreur s\'est produite lors de la connexion au salon vocal');
        }
    }
}; 