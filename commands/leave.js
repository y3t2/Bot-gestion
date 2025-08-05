const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const database = require('../utils/database');

module.exports = {
    name: 'leave',
    aliases: ['depart'],
    description: 'Configure le salon de départ',
    usage: 'leave #salon',
    category: 'Configuration',
    permissions: [PermissionFlagsBits.Administrator],
    async execute(message, args, client) {
        // Vérifier si un salon est mentionné
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('❌ Veuillez mentionner un salon ! Exemple: `+leave #depart`');
        }

        try {
            // Sauvegarder le salon de départ dans la base de données
            await database.setLeaveConfig(message.guild.id, channel.id);

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('✅ Salon de Départ Configuré !')
                .setDescription(`**Salon configuré :** ${channel}\n\n**Fonctionnalités activées :**\n• Messages de départ automatiques\n• Compteur de membres en temps réel\n• Avatar de l'utilisateur affiché`)
                .addFields(
                    { 
                        name: '📋 Message de départ', 
                        value: '> **Au revoir @utilisateur ! Nous sommes désormais X sur le serveur ! 🌟**', 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la configuration du salon de départ:', error);
            message.reply('❌ Une erreur s\'est produite lors de la configuration du salon de départ !');
        }
    }
}; 