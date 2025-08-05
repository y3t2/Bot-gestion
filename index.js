const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const listManager = require('./utils/lists');
const antiRaid = require('./utils/antiraid');
const antiLink = require('./utils/antilink');
const Logger = require('./utils/logger');

// Créer une nouvelle instance du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Collection pour stocker les derniers messages supprimés (par serveur)
client.snipedMessages = new Collection();

// Initialiser le système de logs
const logger = new Logger(client);

// Charger les commandes depuis le dossier commands
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log('Dossier commands non trouvé, création...');
        fs.mkdirSync(commandsPath);
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`✅ Commande chargée: ${command.name}`);
        } else {
            console.log(`❌ Commande invalide dans ${filePath}`);
        }
    }
}

// Fonction pour vérifier si un utilisateur est owner
async function isOwner(userId) {
    return userId === config.ownerID || await listManager.isOwner(userId);
}

// Gestionnaire d'événements pour les messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Vérifier si le bot est mentionné
    if (message.mentions.users.has(client.user.id)) {
        return message.reply(`Hey ${message.author}, Mon Prefix est [${config.prefix}] ! Hésite pas à faire ${config.prefix}helpall pour toutes les commandes !`);
    }
    
    if (!message.content.startsWith(config.prefix)) {
        // Vérifier l'antilink/antihere/antieveryone
        try {
            await antiLink.processMessage(message, client);
        } catch (error) {
            console.error('Erreur lors du traitement antilink:', error);
        }
        return;
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        // Vérifier si l'utilisateur est blacklisté
        const isBlacklisted = await listManager.isBlacklisted(message.author.id);
        if (isBlacklisted) {
            return message.reply('🚫 Vous êtes blacklisté et ne pouvez pas utiliser les commandes du bot.');
        }

        // Vérifier si l'utilisateur est whitelisté (si la whitelist est activée)
        const whitelist = await listManager.getWhitelist();
        if (whitelist.length > 0) {
            const isWhitelisted = await listManager.isWhitelisted(message.author.id);
            if (!isWhitelisted) {
                return message.reply('❌ Vous n\'êtes pas autorisé à utiliser les commandes du bot.');
            }
        }

        // Vérifier les permissions
        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !command.permissions.every(perm => authorPerms.has(perm))) {
                return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande !');
            }
        }

        // Vérifier si la commande est owner-only
        if (command.ownerOnly) {
            const userIsOwner = await isOwner(message.author.id);
            if (!userIsOwner) {
                return message.reply('❌ Cette commande est réservée aux propriétaires du bot !');
            }
        }

        // Logger la commande utilisée
        await logger.logCommand(message.guild, message.author, commandName, message.channel, args);

        // Exécuter la commande
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('❌ Une erreur s\'est produite lors de l\'exécution de cette commande !');
    }
});

// Événement pour gérer les nouveaux membres (blacklist automatique + antiraid)
client.on('guildMemberAdd', async member => {
    // Logger l'arrivée du membre
    await logger.logMember(member.guild, 'Membre Rejoint', member, 'Nouveau membre sur le serveur');

    // Vérifier si l'utilisateur est blacklisté
    const isBlacklisted = await listManager.isBlacklisted(member.user.id);
    if (isBlacklisted) {
        try {
            await member.ban({ reason: 'Utilisateur blacklisté automatiquement' });
            console.log(`🚫 Utilisateur blacklisté ${member.user.tag} banni automatiquement de ${member.guild.name}`);
            await logger.logModeration(member.guild, 'Bannissement Automatique', 'Système', member.user, 'Utilisateur blacklisté');
        } catch (error) {
            console.error(`Erreur lors du bannissement automatique de ${member.user.tag}:`, error);
        }
    }

    // Vérifier avec le système d'antiraid
    try {
        await antiRaid.checkNewMember(member, client);
    } catch (error) {
        console.error('Erreur lors de la vérification antiraid:', error);
    }
    
    // Envoyer le message de bienvenue si configuré
    try {
        const database = require('./utils/database');
        const welcomeConfig = await database.getWelcomeConfig(member.guild.id);
        
        if (welcomeConfig) {
            const channel = member.guild.channels.cache.get(welcomeConfig.channel_id);
            if (channel) {
                const memberCount = member.guild.memberCount;
                const guildName = member.guild.name;
                
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle('🌟 Bienvenue !')
                    .setDescription(`> **Bienvenue ${member} sur \`${guildName}\` 🌟 !**\n> **Nous sommes désormais ${memberCount} sur le serveur ! 🌟**\n> **\`/Ginka\` en statut pour avoir la perm image !**`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

                await channel.send({ embeds: [welcomeEmbed] });
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
    }
    
    // Mettre à jour le RPC
    updateActivity();
});

// Événement pour gérer les départs de membres
client.on('guildMemberRemove', async member => {
    await logger.logMember(member.guild, 'Membre Parti', member, 'Membre a quitté le serveur');
    
    // Envoyer le message de départ si configuré
    try {
        const database = require('./utils/database');
        const leaveConfig = await database.getLeaveConfig(member.guild.id);
        
        if (leaveConfig) {
            const channel = member.guild.channels.cache.get(leaveConfig.channel_id);
            if (channel) {
                const memberCount = member.guild.memberCount;
                
                const leaveEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle('👋 Au revoir !')
                    .setDescription(`> **Au revoir ${member} ! Nous sommes désormais ${memberCount} sur le serveur ! 🌟**`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: '© Powered by y3t2', iconURL: client.user.displayAvatarURL() });

                await channel.send({ embeds: [leaveEmbed] });
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de départ:', error);
    }
    
    // Mettre à jour le RPC
    updateActivity();
});

// Événement pour gérer les modifications de messages
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    await logger.logMessage(newMessage.guild, 'Message Modifié', newMessage, 
        `**Ancien contenu:** ${oldMessage.content}\n**Nouveau contenu:** ${newMessage.content}`);
});

// Événement pour gérer les suppressions de messages
client.on('messageDelete', async message => {
    if (message.author?.bot) return;

    // Stocker le message supprimé pour la commande snipe
    client.snipedMessages.set(message.guild.id, {
        content: message.content,
        author: message.author,
        channel: message.channel,
        timestamp: Date.now(),
        attachments: message.attachments.size > 0 ? Array.from(message.attachments.values()) : []
    });

    await logger.logMessage(message.guild, 'Message Supprimé', message, 'Message supprimé');
});

// Événement pour gérer les créations de rôles
client.on('roleCreate', async role => {
    await logger.logRole(role.guild, 'Rôle Créé', role, 'Système', 'Nouveau rôle créé');
});

// Événement pour gérer les suppressions de rôles
client.on('roleDelete', async role => {
    await logger.logRole(role.guild, 'Rôle Supprimé', role, 'Système', 'Rôle supprimé');
});

// Événement pour gérer les créations de canaux
client.on('channelCreate', async channel => {
    if (channel.type === 0) { // Text channel only
        await logger.logChannel(channel.guild, 'Canal Créé', channel, 'Système', 'Nouveau canal créé');
    }
});

// Événement pour gérer les suppressions de canaux
client.on('channelDelete', async channel => {
    if (channel.type === 0) { // Text channel only
        await logger.logChannel(channel.guild, 'Canal Supprimé', channel, 'Système', 'Canal supprimé');
    }
});

// Événement pour gérer les activités vocales
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    
    // Membre rejoint un canal vocal
    if (!oldState.channel && newState.channel) {
        await logger.logVoice(newState.guild, 'Rejoint Canal Vocal', member, newState.channel, 
            `Canal: ${newState.channel.name}`);
    }
    
    // Membre quitte un canal vocal
    if (oldState.channel && !newState.channel) {
        await logger.logVoice(oldState.guild, 'Quitte Canal Vocal', member, oldState.channel, 
            `Canal: ${oldState.channel.name}`);
    }
    
    // Membre change de canal vocal
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        await logger.logVoice(newState.guild, 'Change Canal Vocal', member, newState.channel, 
            `De: ${oldState.channel.name} → Vers: ${newState.channel.name}`);
    }
});

// Fonction pour calculer le nombre total de membres
function getTotalMembers() {
    let totalMembers = 0;
    client.guilds.cache.forEach(guild => {
        totalMembers += guild.memberCount;
    });
    return totalMembers;
}

// Fonction pour mettre à jour l'activité RPC
function updateActivity() {
    try {
        const totalMembers = getTotalMembers();
        console.log(`🔄 Mise à jour RPC: ${totalMembers} membres`);
        
        client.user.setActivity(`${totalMembers.toLocaleString()} membres`, { 
            type: 3 // WATCHING
        });
        
        console.log(`✅ RPC mis à jour: "${totalMembers.toLocaleString()} membres"`);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du RPC:', error);
    }
}

// Événement ready
client.on('ready', async () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
    console.log(`📊 Servant ${client.guilds.cache.size} serveurs`);
    console.log(`👥 Servant ${client.users.cache.size} utilisateurs`);
    
    // Migrer les anciens fichiers JSON vers SQLite si nécessaire
    await listManager.migrateFromJSON();
    
    // Afficher les informations sur les listes
    const stats = await listManager.getStats();
    console.log(`🚫 Blacklist: ${stats.blacklist_count} utilisateur(s)`);
    console.log(`✅ Whitelist: ${stats.whitelist_count} utilisateur(s)`);
    console.log(`👑 Owners: ${stats.owners_count} propriétaire(s)`);
    
    // Afficher les informations sur l'antiraid
    console.log(`🛡️ Système Antiraid: Actif`);
    
    // Afficher les informations sur l'antilink
    console.log(`🔗 Système Antilink: Actif`);
    
    // Définir l'activité RPC avec le nombre de membres
    updateActivity();
    
    // Mettre à jour l'activité toutes les 5 minutes
    setInterval(updateActivity, 5 * 60 * 1000);
});

// Gestion des erreurs
client.on('error', error => {
    console.error('Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
    console.error('Promesse rejetée non gérée:', error);
});

// Gestion de la fermeture propre
process.on('SIGINT', () => {
    console.log('\n🔄 Arrêt du bot...');
    const database = require('./utils/database');
    database.close();
    process.exit(0);
});

// Charger les commandes et se connecter
loadCommands();
client.login(config.token); 