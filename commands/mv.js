const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'mv',
    aliases: ['move', 'déplacer'],
    description: 'Déplace un utilisateur dans un autre salon vocal',
    usage: 'mv @utilisateur #salon',
    category: 'Vocales',
    permissions: [PermissionFlagsBits.MoveMembers],
    async execute(message, args, client) {
        const user = message.mentions.users.first();
        const channel = message.mentions.channels.first();
        
        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur avec `@utilisateur`');
        }

        if (!channel) {
            return message.reply('❌ Veuillez mentionner un salon vocal avec `#salon`');
        }

        // Vérifier que c'est un salon vocal
        if (channel.type !== 2) { // 2 = GUILD_VOICE
            return message.reply('❌ Le salon mentionné n\'est pas un salon vocal');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Utilisateur non trouvé sur ce serveur');
        }

        if (!member.voice.channel) {
            return message.reply('❌ Cet utilisateur n\'est pas dans un salon vocal');
        }

        const oldChannel = member.voice.channel;
        
        try {
            // Vérifier les permissions
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)) {
                return message.reply('❌ Je n\'ai pas la permission de déplacer des membres');
            }

            if (!channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.Connect)) {
                return message.reply('❌ Je n\'ai pas la permission d\'accéder au salon de destination');
            }

            // Déplacer l'utilisateur
            await member.voice.setChannel(channel);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Utilisateur Déplacé')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag}`, inline: true },
                    { name: 'De', value: `${oldChannel.name}`, inline: true },
                    { name: 'Vers', value: `${channel.name}`, inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors du déplacement:', error);
            message.reply('❌ Une erreur s\'est produite lors du déplacement de l\'utilisateur');
        }
    }
}; 