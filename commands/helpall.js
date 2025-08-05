const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'helpall',
    aliases: ['ha', 'allhelp', 'commands'],
    description: 'Affiche toutes les commandes disponibles',
    usage: 'helpall',
    category: 'Général',
    async execute(message, args, client) {
        const categories = {
            'Général': ['help', 'helpall', 'ping', 'botinfo'],
            'Informations': ['userinfo', 'serverinfo', 'banner', 'vc', 'booster', 'admin', 'ownerbot'],
            'Modération': ['kick', 'ban', 'unban', 'clear', 'lock', 'unlock'],
            'Administration': ['renew', 'say', 'addrole', 'antiraid', 'antilink', 'logs'],
            'Vocales': ['join', 'mv', 'wakeup'],
            'Système': ['blacklist', 'whitelist', 'owner', 'unowner', 'owners'],
            'Utilitaires': ['snipe'],
            'Configuration': ['welcome', 'leave']
        };

        const categoryDescriptions = {
            'Général': 'Commandes de base et d\'aide',
            'Informations': 'Commandes pour obtenir des informations',
            'Modération': 'Commandes de modération des membres',
            'Administration': 'Commandes d\'administration avancées',
            'Vocales': 'Commandes de gestion des salons vocaux',
            'Système': 'Commandes de gestion du système',
            'Utilitaires': 'Commandes utilitaires diverses',
            'Configuration': 'Commandes de configuration du serveur'
        };

        const categoryEmojis = {
            'Général': '🏠',
            'Informations': '📊',
            'Modération': '🛡️',
            'Administration': '⚙️',
            'Vocales': '🎵',
            'Système': '🔧',
            'Utilitaires': '🛠️',
            'Configuration': '🎛️'
        };

        // Créer le menu de sélection
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('helpall_category')
                    .setPlaceholder('Sélectionnez une catégorie pour voir les commandes')
                    .addOptions([
                        {
                            label: 'Général',
                            description: 'Commandes de base et d\'aide',
                            value: 'general',
                            emoji: '🏠'
                        },
                        {
                            label: 'Informations',
                            description: 'Commandes pour obtenir des informations',
                            value: 'info',
                            emoji: '📊'
                        },
                        {
                            label: 'Modération',
                            description: 'Commandes de modération des membres',
                            value: 'mod',
                            emoji: '🛡️'
                        },
                        {
                            label: 'Administration',
                            description: 'Commandes d\'administration avancées',
                            value: 'admin',
                            emoji: '⚙️'
                        },
                        {
                            label: 'Vocales',
                            description: 'Commandes de gestion des salons vocaux',
                            value: 'vocales',
                            emoji: '🎵'
                        },
                        {
                            label: 'Système',
                            description: 'Commandes de gestion du système',
                            value: 'system',
                            emoji: '🔧'
                        },
                        {
                            label: 'Utilitaires',
                            description: 'Commandes utilitaires diverses',
                            value: 'utilitaires',
                            emoji: '🛠️'
                        },
                        {
                            label: 'Configuration',
                            description: 'Commandes de configuration du serveur',
                            value: 'configuration',
                            emoji: '🎛️'
                        }
                    ])
            );

        // Embed principal
        const mainEmbed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('📚 Toutes les Commandes - Bot de Gestion')
            .setDescription(`Bienvenue dans le menu d'aide complet !\n\n**Préfixe:** \`${config.prefix}\`\n**Total:** ${client.commands.size} commandes\n\nUtilisez le menu déroulant ci-dessous pour naviguer entre les catégories de commandes.`)
            .addFields(
                { name: '🏠 Général', value: `${categories['Général'].length} commandes`, inline: true },
                { name: '📊 Informations', value: `${categories['Informations'].length} commandes`, inline: true },
                { name: '🛡️ Modération', value: `${categories['Modération'].length} commandes`, inline: true },
                { name: '⚙️ Administration', value: `${categories['Administration'].length} commandes`, inline: true },
                { name: '🎵 Vocales', value: `${categories['Vocales'].length} commandes`, inline: true },
                { name: '🔧 Système', value: `${categories['Système'].length} commandes`, inline: true },
                { name: '🛠️ Utilitaires', value: `${categories['Utilitaires'].length} commandes`, inline: true },
                { name: '🎛️ Configuration', value: `${categories['Configuration'].length} commandes`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        const msg = await message.reply({ embeds: [mainEmbed], components: [row] });

        // Collecteur pour le menu
        const filter = i => i.customId === 'helpall_category' && i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutes

        collector.on('collect', async i => {
            const category = i.values[0];
            let categoryName, categoryCommands;

            switch (category) {
                case 'general':
                    categoryName = 'Général';
                    categoryCommands = categories['Général'];
                    break;
                case 'info':
                    categoryName = 'Informations';
                    categoryCommands = categories['Informations'];
                    break;
                case 'mod':
                    categoryName = 'Modération';
                    categoryCommands = categories['Modération'];
                    break;
                case 'admin':
                    categoryName = 'Administration';
                    categoryCommands = categories['Administration'];
                    break;
                case 'vocales':
                    categoryName = 'Vocales';
                    categoryCommands = categories['Vocales'];
                    break;
                case 'system':
                    categoryName = 'Système';
                    categoryCommands = categories['Système'];
                    break;
                case 'utilitaires':
                    categoryName = 'Utilitaires';
                    categoryCommands = categories['Utilitaires'];
                    break;
                case 'configuration':
                    categoryName = 'Configuration';
                    categoryCommands = categories['Configuration'];
                    break;
            }

            const emoji = categoryEmojis[categoryName];
            let commandsText = '';

            for (const cmdName of categoryCommands) {
                const command = client.commands.get(cmdName);
                if (command) {
                    const aliases = command.aliases && command.aliases.length > 0 
                        ? ` (${command.aliases.join(', ')})` 
                        : '';
                    commandsText += `\`${config.prefix}${cmdName}\`${aliases} - ${command.description}\n`;
                }
            }

            const categoryEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(`${emoji} ${categoryName} - Commandes`)
                .setDescription(categoryDescriptions[categoryName])
                .addFields(
                    { 
                        name: '📋 Commandes', 
                        value: commandsText || 'Aucune commande trouvée', 
                        inline: false 
                    }
                )
                .addFields(
                    { 
                        name: '💡 Utilisation', 
                        value: `Utilisez \`${config.prefix}help <commande>\` pour plus d'informations sur une commande spécifique.`, 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: `${categoryCommands.length} commande(s) dans cette catégorie | © Powered by y3t2`, iconURL: client.user.displayAvatarURL() });

            await i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            msg.edit({ components: [row] }).catch(() => {});
        });
    }
}; 