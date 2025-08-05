const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'wakeup',
    aliases: ['réveiller', 'wake'],
    description: 'Déplace un utilisateur dans tous les salons vocaux',
    usage: 'wakeup @utilisateur',
    category: 'Vocales',
    permissions: [PermissionFlagsBits.MoveMembers],
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

        const voiceChannels = message.guild.channels.cache.filter(channel => channel.type === 2); // 2 = GUILD_VOICE
        
        if (voiceChannels.size === 0) {
            return message.reply('❌ Aucun salon vocal trouvé sur ce serveur');
        }

        try {
            // Vérifier les permissions
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)) {
                return message.reply('❌ Je n\'ai pas la permission de déplacer des membres');
            }

            const originalChannel = member.voice.channel;
            const movedChannels = [];
            let currentChannel = originalChannel;

            // Déplacer l'utilisateur dans chaque salon vocal
            for (const [_, channel] of voiceChannels) {
                if (channel.id !== currentChannel.id) {
                    try {
                        if (channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.Connect)) {
                            await member.voice.setChannel(channel);
                            movedChannels.push(channel.name);
                            currentChannel = channel;
                            
                            // Attendre un peu entre chaque déplacement
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } catch (error) {
                        console.error(`Erreur lors du déplacement vers ${channel.name}:`, error);
                    }
                }
            }

            // Remettre l'utilisateur dans son salon original
            await member.voice.setChannel(originalChannel);

            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🎵 Wakeup Effectué')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag}`, inline: true },
                    { name: 'Salons visités', value: `${movedChannels.length}`, inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .addFields(
                    { 
                        name: '📋 Salons traversés', 
                        value: movedChannels.length > 0 ? movedChannels.join(', ') : 'Aucun salon accessible', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors du wakeup:', error);
            message.reply('❌ Une erreur s\'est produite lors du wakeup');
        }
    }
}; 