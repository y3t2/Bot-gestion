const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'admin',
    aliases: ['admins', 'administrateurs'],
    description: 'Affiche tous les administrateurs du serveur',
    usage: 'admin',
    category: 'Informations',
    async execute(message, args, client) {
        const guild = message.guild;
        
        // Récupérer tous les membres avec les permissions d'administrateur
        const adminMembers = guild.members.cache.filter(member => 
            member.permissions.has(PermissionFlagsBits.Administrator) ||
            member.roles.cache.some(role => role.permissions.has(PermissionFlagsBits.Administrator))
        );

        if (adminMembers.size === 0) {
            return message.reply('❌ Aucun administrateur trouvé sur ce serveur.');
        }

        // Trier les administrateurs par rôle le plus haut
        const sortedAdmins = adminMembers.sort((a, b) => {
            const aHighestRole = a.roles.highest.position;
            const bHighestRole = b.roles.highest.position;
            return bHighestRole - aHighestRole;
        });

        // Créer les listes d'administrateurs
        const adminList = sortedAdmins.map(member => {
            const roles = member.roles.cache
                .filter(role => role.permissions.has(PermissionFlagsBits.Administrator))
                .map(role => role.name)
                .join(', ');
            
            const status = member.presence?.status || 'offline';
            const statusEmoji = {
                'online': '🟢',
                'idle': '🟡',
                'dnd': '🔴',
                'offline': '⚫'
            }[status] || '⚫';

            return `${statusEmoji} **${member.user.tag}** (${member.id})\n   └ Rôles admin: ${roles || 'Aucun'}`;
        });

        // Diviser en pages si nécessaire
        const adminsPerPage = 10;
        const pages = [];
        
        for (let i = 0; i < adminList.length; i += adminsPerPage) {
            pages.push(adminList.slice(i, i + adminsPerPage));
        }

        const currentPage = 1;
        const currentAdmins = pages[currentPage - 1];

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(`👑 Administrateurs de ${guild.name}`)
            .setDescription(currentAdmins.join('\n\n'))
            .addFields(
                { name: '📊 Statistiques', value: `Total: ${adminMembers.size} administrateur(s)`, inline: true },
                { name: '📄 Pages', value: `${currentPage}/${pages.length}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(guild.iconURL({ dynamic: true }));

        // Ajouter des informations supplémentaires
        const owner = guild.members.cache.get(guild.ownerId);
        if (owner) {
            embed.addFields({
                name: '👑 Propriétaire du serveur',
                value: `${owner.user.tag} (${owner.id})`,
                inline: false
            });
        }

        // Ajouter les rôles avec permissions d'administrateur
        const adminRoles = guild.roles.cache.filter(role => 
            role.permissions.has(PermissionFlagsBits.Administrator)
        );

        if (adminRoles.size > 0) {
            embed.addFields({
                name: '🎭 Rôles avec permissions admin',
                value: adminRoles.map(role => `${role} (${role.members.size} membres)`).join('\n'),
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
}; 