const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class AntiRaid {
    constructor() {
        this.raidDetection = new Map(); // Pour détecter les raids
        this.botDetection = new Map(); // Pour détecter les bots
        this.suspiciousUsers = new Map(); // Utilisateurs suspects
        this.raidThreshold = 5; // Nombre de joins en 10 secondes pour déclencher l'antiraid
        this.botThreshold = 3; // Nombre de bots en 30 secondes pour déclencher l'antibot
        this.timeWindow = 10000; // 10 secondes pour l'antiraid
        this.botTimeWindow = 30000; // 30 secondes pour l'antibot
    }

    // Détecter les raids
    detectRaid(guild) {
        const now = Date.now();
        const guildId = guild.id;
        
        if (!this.raidDetection.has(guildId)) {
            this.raidDetection.set(guildId, []);
        }

        const joins = this.raidDetection.get(guildId);
        joins.push(now);

        // Nettoyer les anciens joins
        const recentJoins = joins.filter(time => now - time < this.timeWindow);
        this.raidDetection.set(guildId, recentJoins);

        return recentJoins.length >= this.raidThreshold;
    }

    // Détecter les bots
    detectBots(guild) {
        const now = Date.now();
        const guildId = guild.id;
        
        if (!this.botDetection.has(guildId)) {
            this.botDetection.set(guildId, []);
        }

        const bots = this.botDetection.get(guildId);
        bots.push(now);

        // Nettoyer les anciens bots
        const recentBots = bots.filter(time => now - time < this.botTimeWindow);
        this.botDetection.set(guildId, recentBots);

        return recentBots.length >= this.botThreshold;
    }

    // Marquer un utilisateur comme suspect
    markSuspicious(userId, guildId, reason) {
        const key = `${guildId}-${userId}`;
        this.suspiciousUsers.set(key, {
            reason,
            timestamp: Date.now()
        });
    }

    // Vérifier si un utilisateur est suspect
    isSuspicious(userId, guildId) {
        const key = `${guildId}-${userId}`;
        return this.suspiciousUsers.has(key);
    }

    // Actions d'antiraid
    async handleRaid(guild, member, client) {
        try {
            // Verrouiller le serveur
            await this.lockServer(guild);
            
            // Bannir le membre suspect
            if (member.bannable) {
                await member.ban({ reason: 'Antiraid: Membre suspect détecté' });
            }

            // Envoyer une alerte
            await this.sendRaidAlert(guild, member, 'RAID', client);

            console.log(`🚨 RAID DÉTECTÉ sur ${guild.name} - Membre banni: ${member.user.tag}`);
        } catch (error) {
            console.error('Erreur lors de la gestion du raid:', error);
        }
    }

    // Actions d'antibot
    async handleBot(guild, member, client) {
        try {
            // Vérifier si c'est un vrai bot (avec le badge bot)
            if (member.user.bot && !member.user.flags?.has('VerifiedBot')) {
                // Bannir le bot non vérifié
                if (member.bannable) {
                    await member.ban({ reason: 'Antibot: Bot non vérifié détecté' });
                }

                // Envoyer une alerte
                await this.sendRaidAlert(guild, member, 'BOT', client);

                console.log(`🤖 BOT DÉTECTÉ sur ${guild.name} - Bot banni: ${member.user.tag}`);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion du bot:', error);
        }
    }

    // Verrouiller le serveur
    async lockServer(guild) {
        try {
            // Verrouiller tous les canaux textuels
            const textChannels = guild.channels.cache.filter(channel => 
                channel.type === 0 && channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.SendMessages)
            );

            for (const [_, channel] of textChannels) {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: false
                });
            }

            // Désactiver les invites
            const invites = await guild.invites.fetch();
            for (const [_, invite] of invites) {
                await invite.delete('Antiraid: Désactivation des invites');
            }

            console.log(`🔒 Serveur ${guild.name} verrouillé pour antiraid`);
        } catch (error) {
            console.error('Erreur lors du verrouillage du serveur:', error);
        }
    }

    // Déverrouiller le serveur
    async unlockServer(guild) {
        try {
            // Déverrouiller tous les canaux textuels
            const textChannels = guild.channels.cache.filter(channel => 
                channel.type === 0 && !channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.SendMessages)
            );

            for (const [_, channel] of textChannels) {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: true
                });
            }

            console.log(`🔓 Serveur ${guild.name} déverrouillé`);
        } catch (error) {
            console.error('Erreur lors du déverrouillage du serveur:', error);
        }
    }

    // Envoyer une alerte de raid
    async sendRaidAlert(guild, member, type, client) {
        try {
            // Trouver un canal de logs ou d'administration
            const logChannel = guild.channels.cache.find(channel => 
                channel.name.includes('log') || 
                channel.name.includes('admin') || 
                channel.name.includes('mod')
            ) || guild.systemChannel;

            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setColor(type === 'RAID' ? '#ff0000' : '#ff6b6b')
                .setTitle(`🚨 ${type === 'RAID' ? 'RAID DÉTECTÉ' : 'BOT DÉTECTÉ'}`)
                .addFields(
                    { name: 'Utilisateur', value: `${member.user.tag} (${member.user.id})`, inline: true },
                    { name: 'Type', value: type === 'RAID' ? 'Raid' : 'Bot non vérifié', inline: true },
                    { name: 'Action', value: 'Banni automatiquement', inline: true },
                    { name: 'Compte créé', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'A rejoint', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: 'Système Antiraid', iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'alerte:', error);
        }
    }

    // Vérifier un nouveau membre
    async checkNewMember(member, client) {
        const guild = member.guild;
        const user = member.user;

        // Vérifier si c'est un bot
        if (user.bot) {
            this.detectBots(guild);
            if (this.detectBots(guild)) {
                await this.handleBot(guild, member, client);
            }
            return;
        }

        // Vérifier les critères suspects
        const isSuspicious = this.checkSuspiciousCriteria(user);
        if (isSuspicious) {
            this.markSuspicious(user.id, guild.id, 'Critères suspects');
        }

        // Détecter les raids
        this.detectRaid(guild);
        if (this.detectRaid(guild)) {
            await this.handleRaid(guild, member, client);
        }
    }

    // Vérifier les critères suspects
    checkSuspiciousCriteria(user) {
        const now = Date.now();
        const accountAge = now - user.createdTimestamp;
        const oneDay = 24 * 60 * 60 * 1000; // 1 jour en millisecondes

        // Compte créé il y a moins d'un jour
        if (accountAge < oneDay) {
            return true;
        }

        // Nom d'utilisateur suspect
        const suspiciousNames = ['discord', 'nitro', 'free', 'gift', 'claim', 'verify'];
        const username = user.username.toLowerCase();
        if (suspiciousNames.some(name => username.includes(name))) {
            return true;
        }

        return false;
    }

    // Obtenir les statistiques
    getStats(guildId) {
        const raidJoins = this.raidDetection.get(guildId) || [];
        const botJoins = this.botDetection.get(guildId) || [];
        const suspiciousCount = Array.from(this.suspiciousUsers.keys())
            .filter(key => key.startsWith(guildId)).length;

        return {
            recentJoins: raidJoins.length,
            recentBots: botJoins.length,
            suspiciousUsers: suspiciousCount
        };
    }
}

module.exports = new AntiRaid(); 