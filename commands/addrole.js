const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'addrole',
    aliases: ['role', 'giverole'],
    description: 'Ajoute ou retire un rôle à un utilisateur',
    usage: 'addrole <@utilisateur> <@rôle>',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageRoles],
    async execute(message, args, client) {
        const user = message.mentions.users.first();
        const role = message.mentions.roles.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur !');
        }

        if (!role) {
            return message.reply('❌ Veuillez mentionner un rôle !');
        }

        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        // Vérifier les permissions
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas les permissions pour gérer les rôles !');
        }

        if (role.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas gérer un rôle supérieur ou égal à votre rôle le plus haut !');
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('❌ Je ne peux pas gérer ce rôle car il est supérieur à mon rôle le plus haut !');
        }

        try {
            if (member.roles.cache.has(role.id)) {
                // Retirer le rôle
                await member.roles.remove(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('👤 Rôle retiré')
                    .addFields(
                        { name: 'Utilisateur', value: `${user.tag}`, inline: true },
                        { name: 'Rôle', value: `${role.name}`, inline: true },
                        { name: 'Action', value: 'Retiré', inline: true },
                        { name: 'Par', value: `${message.author.tag}`, inline: true }
                    )
                    .setTimestamp()
                    .setThumbnail(user.displayAvatarURL());

                message.reply({ embeds: [embed] });
            } else {
                // Ajouter le rôle
                await member.roles.add(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('👤 Rôle ajouté')
                    .addFields(
                        { name: 'Utilisateur', value: `${user.tag}`, inline: true },
                        { name: 'Rôle', value: `${role.name}`, inline: true },
                        { name: 'Action', value: 'Ajouté', inline: true },
                        { name: 'Par', value: `${message.author.tag}`, inline: true }
                    )
                    .setTimestamp()
                    .setThumbnail(user.displayAvatarURL());

                message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la gestion du rôle:', error);
            message.reply('❌ Une erreur s\'est produite lors de la gestion du rôle !');
        }
    }
}; 