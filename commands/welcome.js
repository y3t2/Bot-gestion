const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const database = require('../utils/database');

module.exports = {
    name: 'welcome',
    aliases: ['bienvenue'],
    description: 'Configure le salon de bienvenue',
    usage: 'welcome #salon',
    category: 'Configuration',
    permissions: [PermissionFlagsBits.Administrator],
    async execute(message, args, client) {
        // Vérifier si un salon est mentionné
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('❌ Veuillez mentionner un salon ! Exemple: `+welcome #bienvenue`');
        }

        try {
            // Sauvegarder le salon de bienvenue dans la base de données
            await database.setWelcomeConfig(message.guild.id, channel.id);

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('✅ Salon de Bienvenue Configuré !')
                .setDescription(`**Salon configuré :** ${channel}\n\n**Fonctionnalités activées :**\n• Messages de bienvenue automatiques\n• Compteur de membres en temps réel\n• Avatar de l'utilisateur affiché`)
                .addFields(
                    { 
                        name: '📋 Message de bienvenue', 
                        value: '> **Bienvenue @utilisateur sur `NomDuServeur` 🌟 !**\n> **Nous sommes désormais X sur le serveur ! 🌟**\n> **`/Ginka` en statut pour avoir la perm image !**', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la configuration du salon de bienvenue:', error);
            message.reply('❌ Une erreur s\'est produite lors de la configuration du salon de bienvenue !');
        }
    }
}; 