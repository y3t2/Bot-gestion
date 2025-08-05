const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class Logger {
    constructor(client) {
        this.client = client;
    }

    // Trouver un salon de logs par nom
    async findLogChannel(guild, channelName) {
        try {
            const channel = guild.channels.cache.find(ch => 
                ch.name === channelName && 
                ch.type === 0 && // Text channel
                ch.parent?.name === '📋 LOGS DU SERVEUR'
            );
            return channel;
        } catch (error) {
            console.error(`Erreur lors de la recherche du salon ${channelName}:`, error);
            return null;
        }
    }

    // Envoyer un log dans un salon spécifique
    async sendLog(guild, channelName, embed) {
        try {
            const channel = await this.findLogChannel(guild, channelName);
            if (channel) {
                await channel.send({ embeds: [embed] });
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Erreur lors de l'envoi du log dans ${channelName}:`, error);
            return false;
        }
    }

    // Logs de modération
    async logModeration(guild, action, moderator, target, reason = 'Aucune raison spécifiée') {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle(`🔨 Action de Modération: ${action}`)
            .setDescription(`**Modérateur:** ${moderator}\n**Cible:** ${target}\n**Raison:** ${reason}`)
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🔨-modération', embed);
    }

    // Logs des membres
    async logMember(guild, action, member, details = '') {
        const embed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle(`👤 ${action}`)
            .setDescription(`**Membre:** ${member}\n**ID:** ${member.id}\n**Compte créé:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
            .addFields(
                { name: '📅 Rejoint le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '📊 Détails', value: details || 'Aucun détail supplémentaire', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '👤-membres', embed);
    }

    // Logs des messages
    async logMessage(guild, action, message, details = '') {
        const embed = new EmbedBuilder()
            .setColor('#ffe66d')
            .setTitle(`💬 ${action}`)
            .setDescription(`**Auteur:** ${message.author}\n**Canal:** ${message.channel}\n**ID du message:** ${message.id}`)
            .addFields(
                { name: '📝 Contenu', value: message.content || 'Aucun contenu', inline: false },
                { name: '📊 Détails', value: details || 'Aucun détail supplémentaire', inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '💬-messages', embed);
    }

    // Logs des rôles
    async logRole(guild, action, role, executor = 'Système', details = '') {
        const embed = new EmbedBuilder()
            .setColor('#a8e6cf')
            .setTitle(`🎭 ${action}`)
            .setDescription(`**Rôle:** ${role}\n**ID:** ${role.id}\n**Exécuteur:** ${executor}`)
            .addFields(
                { name: '🎨 Couleur', value: role.hexColor, inline: true },
                { name: '📊 Position', value: role.position.toString(), inline: true },
                { name: '🔒 Permissions', value: role.permissions.toArray().length > 0 ? role.permissions.toArray().slice(0, 5).join(', ') : 'Aucune', inline: true },
                { name: '📝 Détails', value: details || 'Aucun détail supplémentaire', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🎭-rôles', embed);
    }

    // Logs des canaux
    async logChannel(guild, action, channel, executor = 'Système', details = '') {
        const embed = new EmbedBuilder()
            .setColor('#ff9ff3')
            .setTitle(`📺 ${action}`)
            .setDescription(`**Canal:** ${channel}\n**ID:** ${channel.id}\n**Type:** ${channel.type}\n**Exécuteur:** ${executor}`)
            .addFields(
                { name: '📝 Détails', value: details || 'Aucun détail supplémentaire', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '📺-canaux', embed);
    }

    // Logs anti-raid
    async logAntiRaid(guild, action, user, details = '') {
        const embed = new EmbedBuilder()
            .setColor('#ff4757')
            .setTitle(`🛡️ ${action}`)
            .setDescription(`**Utilisateur:** ${user}\n**ID:** ${user.id}`)
            .addFields(
                { name: '🚨 Type de menace', value: action, inline: true },
                { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📊 Détails', value: details || 'Aucun détail supplémentaire', inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🛡️-anti-raid', embed);
    }

    // Logs anti-lien
    async logAntiLink(guild, action, user, channel, content = '') {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle(`🔗 ${action}`)
            .setDescription(`**Utilisateur:** ${user}\n**Canal:** ${channel}\n**ID:** ${user.id}`)
            .addFields(
                { name: '📝 Contenu supprimé', value: content || 'Aucun contenu', inline: false },
                { name: '⚡ Action', value: action, inline: true },
                { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🔗-anti-lien', embed);
    }

    // Logs blacklist/whitelist
    async logListAction(guild, action, target, executor, listType) {
        const embed = new EmbedBuilder()
            .setColor(listType === 'blacklist' ? '#ff4757' : '#2ed573')
            .setTitle(`🚫 ${action}`)
            .setDescription(`**Cible:** ${target}\n**ID:** ${target.id}\n**Exécuteur:** ${executor}\n**Liste:** ${listType}`)
            .addFields(
                { name: '📊 Action', value: action, inline: true },
                { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(target.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🚫-blacklist', embed);
    }

    // Logs des commandes
    async logCommand(guild, user, command, channel, args = []) {
        const embed = new EmbedBuilder()
            .setColor('#70a1ff')
            .setTitle(`⚙️ Commande Utilisée`)
            .setDescription(`**Utilisateur:** ${user}\n**Commande:** ${command}\n**Canal:** ${channel}`)
            .addFields(
                { name: '📝 Arguments', value: args.length > 0 ? args.join(' ') : 'Aucun argument', inline: false },
                { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '⚙️-commandes', embed);
    }

    // Logs vocaux
    async logVoice(guild, action, member, channel, details = '') {
        const embed = new EmbedBuilder()
            .setColor('#ffa502')
            .setTitle(`🔊 ${action}`)
            .setDescription(`**Membre:** ${member}\n**Canal:** ${channel || 'Aucun canal'}`)
            .addFields(
                { name: '📊 Détails', value: details || 'Aucun détail supplémentaire', inline: false },
                { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        await this.sendLog(guild, '🔊-vocaux', embed);
    }

    // Log personnalisé
    async logCustom(guild, channelName, title, description, color = config.embedColor, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: '© Powered by y3t2', iconURL: this.client.user.displayAvatarURL() });

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        await this.sendLog(guild, channelName, embed);
    }
}

module.exports = Logger; 