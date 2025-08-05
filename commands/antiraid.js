const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const antiRaid = require('../utils/antiraid');

module.exports = {
    name: 'antiraid',
    aliases: ['ar'],
    description: 'Gère le système d\'antiraid et antibot',
    usage: 'antiraid <on/off/status/unlock>',
    category: 'Administration',
    permissions: [PermissionFlagsBits.Administrator],
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply('❌ Veuillez spécifier une action: `on`, `off`, `status` ou `unlock`');
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'on':
                await this.enableAntiraid(message);
                break;
            case 'off':
                await this.disableAntiraid(message);
                break;
            case 'status':
                await this.showStatus(message);
                break;
            case 'unlock':
                await this.unlockServer(message);
                break;
            default:
                message.reply('❌ Action invalide. Utilisez `on`, `off`, `status` ou `unlock`');
        }
    },

    async enableAntiraid(message) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🛡️ Système Antiraid Activé')
            .setDescription('Le système d\'antiraid et antibot est maintenant actif.')
            .addFields(
                { name: '🚨 Détection de raid', value: '5+ joins en 10 secondes', inline: true },
                { name: '🤖 Détection de bots', value: '3+ bots en 30 secondes', inline: true },
                { name: '🔒 Actions automatiques', value: 'Bannissement + Verrouillage', inline: true }
            )
            .addFields(
                { name: '⚠️ Critères suspects', value: 'Comptes < 1 jour, noms suspects', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Activé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async disableAntiraid(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🛡️ Système Antiraid Désactivé')
            .setDescription('Le système d\'antiraid et antibot a été désactivé.')
            .setTimestamp()
            .setFooter({ text: `Désactivé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async showStatus(message) {
        const guild = message.guild;
        const stats = antiRaid.getStats(guild.id);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🛡️ Statut du Système Antiraid')
            .addFields(
                { name: '📊 Statistiques récentes', value: `Joins: ${stats.recentJoins}\nBots: ${stats.recentBots}\nSuspects: ${stats.suspiciousUsers}`, inline: true },
                { name: '⚙️ Configuration', value: `Seuil raid: 5 joins\nSeuil bot: 3 bots\nFenêtre raid: 10s\nFenêtre bot: 30s`, inline: true }
            )
            .addFields(
                { name: '🔍 Critères de détection', value: '• Comptes créés il y a < 1 jour\n• Noms d\'utilisateur suspects\n• Bots non vérifiés\n• Joins massifs', inline: false }
            )
            .addFields(
                { name: '🛡️ Actions automatiques', value: '• Bannissement des membres suspects\n• Bannissement des bots non vérifiés\n• Verrouillage du serveur\n• Désactivation des invites\n• Alertes dans les canaux de logs', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },

    async unlockServer(message) {
        try {
            await antiRaid.unlockServer(message.guild);
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Serveur Déverrouillé')
                .setDescription('Le serveur a été déverrouillé manuellement.')
                .addFields(
                    { name: 'Action', value: 'Déverrouillage manuel', inline: true },
                    { name: 'Par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Déverrouillé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors du déverrouillage:', error);
            message.reply('❌ Une erreur s\'est produite lors du déverrouillage du serveur !');
        }
    }
}; 