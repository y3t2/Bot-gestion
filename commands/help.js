const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'help',
    aliases: ['h', 'aide'],
    description: 'Affiche le menu d\'aide',
    usage: 'help',
    category: 'Général',
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('・━━━━━「 Aide 」━━━━━・')
            .setDescription(`
                **Pour des informations détaillées sur les commandes :**
                Tapez la commande \`${config.prefix}helpall\` pour tout savoir
                
                ━━━━━━⊱✿⊰━━━━━━
                **Commandes Vocales :**
                \`${config.prefix}join @utilisateur\` - Rejoint le salon vocal d'un utilisateur
                \`${config.prefix}mv @utilisateur #salon\` - Déplace un utilisateur dans un autre salon vocal
                \`${config.prefix}vc\` - Affiche les statistiques vocales du serveur
                \`${config.prefix}wakeup @utilisateur\` - Déplace un utilisateur dans tous les salons vocaux
                
                ━━━━━━⊱✿⊰━━━━━━
                **Contact Owner :**
                Si vous avez des questions ou besoin d'aide, [cliquez ici](${config.link}) pour rejoindre le serveur officiel du bot
                ━━━━━━⊱✿⊰━━━━━━
                **Info sur l'Owner :**
                Utilisez la commande \`${config.prefix}ownerbot\` pour en savoir plus sur l'owner
            `)
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
}; 