const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'logs',
    aliases: ['logsystem', 'setuplogs'],
    description: 'Crée un système de logs complet pour le serveur',
    usage: 'logs',
    category: 'Administration',
    permissions: [PermissionFlagsBits.Administrator],
    async execute(message, args, client) {
        const guild = message.guild;

        try {
            // Créer la catégorie des logs
            const logsCategory = await guild.channels.create({
                name: '📋 LOGS DU SERVEUR',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: guild.roles.highest.id, // Rôle le plus haut (Admin)
                        allow: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📋 Système de Logs en cours de création...')
                .setDescription('Création des salons de logs en cours...')
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            const statusMsg = await message.reply({ embeds: [embed] });

            // Liste des salons à créer
            const logChannels = [
                {
                    name: '🔨-modération',
                    description: 'Logs de modération (kick, ban, unban, etc.)'
                },
                {
                    name: '👤-membres',
                    description: 'Logs des membres (join, leave, etc.)'
                },
                {
                    name: '💬-messages',
                    description: 'Logs des messages (suppression, modification)'
                },
                {
                    name: '🎭-rôles',
                    description: 'Logs des rôles (création, suppression, attribution)'
                },
                {
                    name: '📺-canaux',
                    description: 'Logs des canaux (création, suppression, modification)'
                },
                {
                    name: '🛡️-anti-raid',
                    description: 'Logs du système anti-raid et antibot'
                },
                {
                    name: '🔗-anti-lien',
                    description: 'Logs du système antilink, antihere, antieveryone'
                },
                {
                    name: '🚫-blacklist',
                    description: 'Logs des actions de blacklist/whitelist'
                },
                {
                    name: '⚙️-commandes',
                    description: 'Logs des commandes utilisées'
                },
                {
                    name: '🔊-vocaux',
                    description: 'Logs des activités vocales'
                }
            ];

            const createdChannels = [];

            // Créer chaque salon de logs
            for (const channelInfo of logChannels) {
                try {
                    const channel = await guild.channels.create({
                        name: channelInfo.name,
                        type: ChannelType.GuildText,
                        parent: logsCategory.id,
                        topic: channelInfo.description,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                            },
                            {
                                id: guild.roles.highest.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    });

                    createdChannels.push(channel);
                    
                    // Envoyer un message de configuration dans chaque salon
                    const channelEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle(`📋 ${channelInfo.name.toUpperCase()}`)
                        .setDescription(`**Description:** ${channelInfo.description}\n\n**Statut:** ✅ Salon configuré\n**Permissions:** Seuls les administrateurs peuvent voir ce salon`)
                        .addFields(
                            { name: '📊 Utilisation', value: 'Ce salon recevra automatiquement les logs correspondants', inline: true },
                            { name: '🔒 Sécurité', value: 'Salon privé - Admin uniquement', inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

                    await channel.send({ embeds: [channelEmbed] });

                } catch (error) {
                    console.error(`Erreur lors de la création du salon ${channelInfo.name}:`, error);
                }
            }

            // Créer le salon de configuration
            const configChannel = await guild.channels.create({
                name: '⚙️-configuration-logs',
                type: ChannelType.GuildText,
                parent: logsCategory.id,
                topic: 'Configuration et gestion du système de logs',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: guild.roles.highest.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            // Message de configuration final
            const configEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('⚙️ Configuration du Système de Logs')
                .setDescription('**Système de logs créé avec succès !**\n\nVoici la liste des salons créés :')
                .addFields(
                    { 
                        name: '📋 Salons de Logs', 
                        value: createdChannels.map(ch => `• ${ch}`).join('\n'), 
                        inline: false 
                    },
                    { 
                        name: '🔧 Configuration', 
                        value: `${configChannel} - Gestion du système`, 
                        inline: false 
                    }
                )
                .addFields(
                    { 
                        name: '📊 Statistiques', 
                        value: `• ${createdChannels.length} salons de logs créés\n• 1 salon de configuration\n• Catégorie: ${logsCategory.name}`, 
                        inline: false 
                    },
                    { 
                        name: '🛡️ Sécurité', 
                        value: '• Tous les salons sont privés\n• Seuls les administrateurs peuvent voir les logs\n• Aucun membre ne peut envoyer de messages', 
                        inline: false 
                    }
                )
                .addFields(
                    { 
                        name: '💡 Utilisation', 
                        value: 'Le système de logs est maintenant actif et enregistrera automatiquement toutes les actions importantes du serveur.', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            await configChannel.send({ embeds: [configEmbed] });

            // Message de confirmation final
            const finalEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Système de Logs Créé !')
                .setDescription(`**Système de logs configuré avec succès !**\n\n**Catégorie créée:** ${logsCategory}\n**Salons créés:** ${createdChannels.length}\n**Salon de config:** ${configChannel}`)
                .addFields(
                    { 
                        name: '📋 Salons Disponibles', 
                        value: '🔨-modération | 👤-membres | 💬-messages | 🎭-rôles | 📺-canaux | 🛡️-anti-raid | 🔗-anti-lien | 🚫-blacklist | ⚙️-commandes | 🔊-vocaux', 
                        inline: false 
                    },
                    { 
                        name: '🔧 Prochaines Étapes', 
                        value: '1. Vérifiez les permissions des salons\n2. Testez le système avec quelques actions\n3. Configurez les webhooks si nécessaire', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            await statusMsg.edit({ embeds: [finalEmbed] });

        } catch (error) {
            console.error('Erreur lors de la création du système de logs:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur lors de la création')
                .setDescription('Une erreur s\'est produite lors de la création du système de logs.')
                .addFields(
                    { name: '🔍 Vérifications', value: '• Vérifiez que j\'ai les permissions Administrateur\n• Vérifiez que je peux créer des canaux\n• Vérifiez l\'espace disponible', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [errorEmbed] });
        }
    }
}; 