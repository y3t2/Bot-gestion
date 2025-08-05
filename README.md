# 🤖 Bot de Gestion Discord

Un bot Discord complet avec système de modération, gestion des listes (blacklist/whitelist/owners), et système d'antiraid avec antibot.

## ✨ Fonctionnalités

### 🛡️ Modération
- **Kick** - Expulser un membre
- **Ban** - Bannir un membre
- **Unban** - Débannir un membre
- **Clear** - Supprimer des messages
- **Lock/Unlock** - Verrouiller/Déverrouiller des canaux
- **Renew** - Recréer un canal
- **Addrole** - Ajouter/Retirer un rôle

### 📊 Informations
- **Userinfo** - Informations sur un utilisateur
- **Serverinfo** - Informations sur le serveur
- **Botinfo** - Informations sur le bot
- **Banner** - Afficher la bannière du serveur
- **VC** - Informations sur les canaux vocaux
- **Booster** - Liste des boosters du serveur
- **Admin** - Liste des administrateurs

### 📋 Système de Logs
- **Logs automatiques** de toutes les actions importantes
- **Salons spécialisés** pour chaque type d'événement
- **Logs de modération** (kick, ban, unban)
- **Logs des membres** (join, leave)
- **Logs des messages** (suppression, modification)
- **Logs des rôles** (création, suppression, attribution)
- **Logs des canaux** (création, suppression)
- **Logs anti-raid** et **anti-lien**
- **Logs des commandes** utilisées
- **Logs vocaux** (join, leave, move)

### 🛡️ Système Antiraid
- **Détection automatique** des raids (5+ joins en 10 secondes)
- **Antibot** (3+ bots en 30 secondes)
- **Critères suspects** (comptes < 1 jour, noms suspects)
- **Actions automatiques** : Bannissement + Verrouillage du serveur
- **Alertes** dans les canaux de logs
- **Commande antiraid** pour gérer le système

### 🚫 Système de Listes
- **Blacklist** - Empêcher l'utilisation du bot
- **Whitelist** - Restreindre l'accès aux commandes
- **Owners** - Gestion des propriétaires du bot
- **Stockage SQLite** pour la persistance des données

### 🎯 Administration
- **Say** - Faire parler le bot
- **Antiraid** - Gérer le système d'antiraid
- **Logs** - Créer un système de logs complet
- **Help/Helpall** - Système d'aide interactif

## 🚀 Installation

### Prérequis
- Node.js 16.9.0 ou supérieur
- npm ou yarn
- Un token de bot Discord

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd bot-gestion
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer le bot**
   - Copiez `config.example.json` vers `config.json`
   - Remplissez les informations nécessaires :
```json
{
    "token": "VOTRE_TOKEN_BOT",
    "prefix": "+",
    "ownerID": "VOTRE_ID_DISCORD",
    "embedColor": "#0099ff"
}
```

4. **Lancer le bot**
```bash
npm start
```

## 📋 Commandes

### 🏠 Général
| Commande | Description | Usage |
|----------|-------------|-------|
| `help` | Menu d'aide interactif | `help [catégorie]` |
| `helpall` | Toutes les commandes | `helpall` |
| `ping` | Latence du bot | `ping` |
| `botinfo` | Informations du bot | `botinfo` |

### 📊 Informations
| Commande | Description | Usage |
|----------|-------------|-------|
| `userinfo` | Infos sur un utilisateur | `userinfo [@utilisateur]` |
| `serverinfo` | Infos sur le serveur | `serverinfo` |
| `banner` | Bannière du serveur | `banner` |
| `vc` | Canaux vocaux | `vc` |
| `booster` | Boosters du serveur | `booster` |
| `admin` | Administrateurs | `admin` |

### 🛡️ Modération
| Commande | Description | Usage | Permissions |
|----------|-------------|-------|-------------|
| `kick` | Expulser un membre | `kick @utilisateur [raison]` | Kick Members |
| `ban` | Bannir un membre | `ban @utilisateur [raison]` | Ban Members |
| `unban` | Débannir un membre | `unban ID_utilisateur` | Ban Members |
| `clear` | Supprimer des messages | `clear [nombre]` | Manage Messages |
| `lock` | Verrouiller un canal | `lock [#canal]` | Manage Channels |
| `unlock` | Déverrouiller un canal | `unlock [#canal]` | Manage Channels |
| `renew` | Recréer un canal | `renew [#canal]` | Manage Channels |
| `addrole` | Gérer les rôles | `addrole @utilisateur @rôle` | Manage Roles |

### ⚙️ Administration
| Commande | Description | Usage | Permissions |
|----------|-------------|-------|-------------|
| `say` | Faire parler le bot | `say [message]` | Manage Messages |
| `antiraid` | Gérer l'antiraid | `antiraid <on/off/status/unlock>` | Administrator |
| `logs` | Créer un système de logs | `logs` | Administrator |

### 🔧 Système
| Commande | Description | Usage | Accès |
|----------|-------------|-------|-------|
| `blacklist` | Gérer la blacklist | `blacklist <add/remove/list> [ID]` | Owner |
| `whitelist` | Gérer la whitelist | `whitelist <add/remove/list> [ID]` | Owner |
| `owner` | Gérer les owners | `owner <add/remove/list> [ID]` | Owner |

## 🛡️ Système Antiraid

Le bot inclut un système d'antiraid avancé qui :

### 🔍 Détection
- **Raid** : 5+ joins en 10 secondes
- **Bot** : 3+ bots en 30 secondes
- **Critères suspects** :
  - Comptes créés il y a moins d'un jour
  - Noms d'utilisateur suspects (discord, nitro, free, etc.)

### 🛡️ Actions Automatiques
- Bannissement des membres suspects
- Bannissement des bots non vérifiés
- Verrouillage de tous les canaux textuels
- Désactivation des invites
- Alertes dans les canaux de logs

### ⚙️ Gestion
- `antiraid on` - Activer le système
- `antiraid off` - Désactiver le système
- `antiraid status` - Voir le statut
- `antiraid unlock` - Déverrouiller manuellement

## 🗄️ Base de Données

Le bot utilise SQLite pour stocker :
- **Blacklist** - Utilisateurs interdits
- **Whitelist** - Utilisateurs autorisés
- **Owners** - Propriétaires du bot

### Migration
Le bot migre automatiquement les anciens fichiers JSON vers SQLite au démarrage.

## 🔧 Configuration

### config.json
```json
{
    "token": "VOTRE_TOKEN_BOT",
    "prefix": "+",
    "ownerID": "VOTRE_ID_DISCORD",
    "embedColor": "#0099ff"
}
```

### Variables d'environnement
Vous pouvez aussi utiliser des variables d'environnement :
- `DISCORD_TOKEN`
- `BOT_PREFIX`
- `OWNER_ID`

## 📁 Structure du Projet

```
bot-gestion/
├── commands/           # Commandes du bot
│   ├── help.js
│   ├── ping.js
│   ├── kick.js
│   ├── ban.js
│   ├── unban.js
│   ├── clear.js
│   ├── userinfo.js
│   ├── serverinfo.js
│   ├── lock.js
│   ├── renew.js
│   ├── say.js
│   ├── addrole.js
│   ├── admin.js
│   ├── botinfo.js
│   ├── unlock.js
│   ├── vc.js
│   ├── banner.js
│   ├── booster.js
│   ├── antiraid.js
│   ├── blacklist.js
│   ├── whitelist.js
│   ├── owner.js
│   └── helpall.js
├── utils/              # Utilitaires
│   ├── database.js     # Gestion SQLite
│   ├── lists.js        # Gestion des listes
│   └── antiraid.js     # Système antiraid
├── data/               # Données SQLite
│   └── bot.db
├── config.json         # Configuration
├── package.json
├── index.js           # Point d'entrée
└── README.md
```

## 🚀 Déploiement

### Local
```bash
npm start
```

### PM2 (Recommandé)
```bash
npm install -g pm2
pm2 start index.js --name "bot-gestion"
pm2 save
pm2 startup
```

### Docker
```bash
docker build -t bot-gestion .
docker run -d --name bot-gestion bot-gestion
```

## 🔒 Permissions Requises

Le bot nécessite les permissions suivantes :
- **Administrator** (recommandé) ou permissions spécifiques :
  - Manage Messages
  - Kick Members
  - Ban Members
  - Manage Channels
  - Manage Roles
  - Send Messages
  - Embed Links
  - Attach Files
  - Read Message History

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les dépendances sont installées
2. Vérifiez votre configuration
3. Consultez les logs d'erreur
4. Ouvrez une issue sur GitHub

## 🔄 Mises à Jour

### v2.0.0
- ✅ Système d'antiraid complet
- ✅ Nouvelles commandes (botinfo, banner, vc, booster, unlock)
- ✅ Menu d'aide interactif
- ✅ Migration SQLite
- ✅ Système antibot
- ✅ Commandes d'administration avancées

### v1.0.0
- ✅ Commandes de base
- ✅ Système de listes
- ✅ Modération
- ✅ Stockage JSON 

## 📋 Système de Logs

Le bot inclut un système de logs complet et automatique :

### 🏗️ Installation
Utilisez la commande `+logs` pour créer automatiquement :
- **Catégorie** : "📋 LOGS DU SERVEUR"
- **10 salons spécialisés** pour différents types d'événements
- **Salon de configuration** pour la gestion

### 📊 Salons de Logs
| Salon | Description | Événements |
|-------|-------------|------------|
| `🔨-modération` | Actions de modération | Kick, Ban, Unban |
| `👤-membres` | Activité des membres | Join, Leave |
| `💬-messages` | Messages | Suppression, Modification |
| `🎭-rôles` | Gestion des rôles | Création, Suppression, Attribution |
| `📺-canaux` | Gestion des canaux | Création, Suppression |
| `🛡️-anti-raid` | Système antiraid | Détections, Actions |
| `🔗-anti-lien` | Système antilink | Violations, Actions |
| `🚫-blacklist` | Gestion des listes | Ajout, Retrait |
| `⚙️-commandes` | Utilisation des commandes | Toutes les commandes |
| `🔊-vocaux` | Activité vocale | Join, Leave, Move |

### 🔒 Sécurité
- **Salons privés** - Seuls les administrateurs peuvent voir
- **Permissions restreintes** - Aucun membre ne peut envoyer de messages
- **Logs détaillés** - Informations complètes sur chaque action

### 📈 Fonctionnalités
- **Logs automatiques** de tous les événements
- **Embeds colorés** selon le type d'action
- **Informations détaillées** (utilisateur, raison, timestamp)
- **Thumbnails** des utilisateurs concernés
- **Historique complet** de toutes les actions 
