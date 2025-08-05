const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const listManager = require('../utils/lists');

module.exports = {
    name: 'whitelist',
    aliases: ['wl'],
    description: 'Gère la liste blanche des utilisateurs',
    usage: 'whitelist <add/remove/list> [@utilisateur]',
    category: 'Administration',
    ownerOnly: true,
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply('❌ Veuillez spécifier une action: `add`, `remove` ou `list`');
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'add':
                await this.addToWhitelist(message, args.slice(1));
                break;
            case 'remove':
                await this.removeFromWhitelist(message, args.slice(1));
                break;
            case 'list':
                await this.showWhitelist(message);
                break;
            default:
                message.reply('❌ Action invalide. Utilisez `add`, `remove` ou `list`');
        }
    },

    async addToWhitelist(message, args) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à ajouter à la whitelist !');
        }

        if (user.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous whitelist vous-même !');
        }

        if (user.id === client.user.id) {
            return message.reply('❌ Je ne peux pas me whitelist moi-même !');
        }

        const isWhitelisted = await listManager.isWhitelisted(user.id);
        if (isWhitelisted) {
            return message.reply('❌ Cet utilisateur est déjà dans la whitelist !');
        }

        const result = await listManager.addToWhitelist(user.id, message.guild.id, message.author.id);
        if (result) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Utilisateur whitelisté')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Whitelisté par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Une erreur s\'est produite lors de l\'ajout à la whitelist !');
        }
    },

    async removeFromWhitelist(message, args) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à retirer de la whitelist !');
        }

        const isWhitelisted = await listManager.isWhitelisted(user.id);
        if (!isWhitelisted) {
            return message.reply('❌ Cet utilisateur n\'est pas dans la whitelist !');
        }

        const result = await listManager.removeFromWhitelist(user.id, message.guild.id);
        if (result) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Utilisateur retiré de la whitelist')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Retiré par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Une erreur s\'est produite lors du retrait de la whitelist !');
        }
    },

    async showWhitelist(message) {
        const whitelist = await listManager.getWhitelist();
        
        if (whitelist.length === 0) {
            return message.reply('📋 La whitelist est vide.');
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Liste des utilisateurs whitelistés')
            .setDescription(whitelist.map(entry => 
                `<@${entry.user_id}> (${entry.user_id})`
            ).join('\n'))
            .setTimestamp()
            .setFooter({ text: `Total: ${whitelist.length} utilisateur(s)`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
}; 