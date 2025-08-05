const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'clear',
    aliases: ['purge', 'delete'],
    description: 'Supprime un nombre spécifié de messages',
    usage: 'clear <nombre>',
    category: 'Modération',
    permissions: [PermissionFlagsBits.ManageMessages],
    execute(message, args, client) {
        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
            return message.reply('❌ Veuillez spécifier un nombre entre 1 et 100 !');
        }

        message.channel.bulkDelete(amount, true)
            .then(messages => {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🗑️ Messages supprimés')
                    .setDescription(`✅ **${messages.size}** messages ont été supprimés.`)
                    .setTimestamp()
                    .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

                message.channel.send({ embeds: [embed] })
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(() => {});
                        }, 5000);
                    });
            })
            .catch(error => {
                console.error(error);
                message.reply('❌ Une erreur s\'est produite lors de la suppression des messages !');
            });
    }
}; 