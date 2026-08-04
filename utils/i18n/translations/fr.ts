import type { Translation } from "../types";

const fr: Translation = {
  common: {
    cancel: "Annuler",
    continue: "Continuer",
    close: "Fermer",
    okay: "D'accord",
    loading: "Chargement…",
    save: "Enregistrer",
    create: "Créer",
    delete: "Supprimer",
    rename: "Renommer",
    remove: "Retirer",
    confirm: "Confirmer",
    human: "Humain",
    bot: "Bot",
    webhook: "Webhook",
  },

  nav: {
    support: "Assistance",
    tip: "Pourboire",
    createGroup: "Créer un groupe interserveur",
    exploreGroups: "Explorer les groupes",
    inviteBot: "Inviter le bot",
    inviteBotWarningTitle: "Avertissement",
    inviteBotWarningBody:
      "Il est nécessaire qu'Orax accède au contenu des messages afin de les synchroniser entre les canaux. En invitant Orax, il pourra lire tous les messages de votre serveur.\nPour des raisons de sécurité et de confidentialité, nous vous suggérons de lui donner la permission de lire les messages uniquement dans les canaux où il est utilisé.",
    switchPlatform: "Changer de plateforme",
    logout: "Se déconnecter",
    user: "Utilisateur",
  },

  oraxPlus: {
    badgeActive: "Orax Plus",
    badgeFree: "Plan gratuit",
    title: "Orax Plus",
    activeDesc:
      "Ce serveur dispose des limites étendues d'Orax Plus, de la traduction automatique, de la commande /resync et de la livraison prioritaire des messages.",
    freeDescVote:
      "Votez gratuitement sur {provider}, abonnez-vous mensuellement ou achetez à vie pour débloquer des limites plus élevées, la traduction automatique, /resync et la livraison prioritaire des messages.",
    freeDescNoVote:
      "Abonnez-vous mensuellement ou achetez à vie pour débloquer des limites plus élevées, la traduction automatique, /resync et la livraison prioritaire des messages.",
    voteExpiresIn:
      "Expire dans {time}, votez à nouveau pour prolonger votre plan.",
    ownedGroups: "groupes possédés",
    channelsPerGroup: "canaux par groupe",
    subscribe: "S'abonner ${price}/mois",
    lifetime: "À vie 19,99 $",
    footnotePrefix:
      "Garantie de remboursement de 15 jours. Besoin de déplacer Orax Plus vers un autre serveur ? ",
    footnoteLink: "Contactez l'assistance",
    footnoteSuffix: " pour le transférer à tout moment.",
    only: "Orax Plus uniquement",
    requiredTitle: "Orax Plus requis",
    requiredDesc:
      "La traduction automatique est une fonctionnalité Orax Plus. {vote} ou abonnez-vous à Orax Plus pour activer la traduction automatique de ce groupe.",
    requiredDescNoVote:
      " Abonnez-vous à Orax Plus pour activer la traduction automatique de ce groupe.",
    voteNotDetectedTitle: "Vote non détecté pour le moment",
    voteNotDetectedDesc:
      "Top.gg traite peut-être encore le vote. Actualisez {context} dans un instant si Orax Plus n'apparaît pas.",
    activatedTitle: "Orax Plus activé",
    activatedExtendedDesc:
      "Votre vote Top.gg a prolongé le plan de ce serveur.",
    activatedNewDesc: "Votre vote Top.gg a été appliqué à ce serveur.",
    activatedTopggDesc:
      "Votre dernier vote Top.gg a été appliqué à ce serveur.",
    voteOpenedTitle: "Vote ouvert",
    voteOpenedDesc:
      "Orax Plus s'activera automatiquement lorsque Top.gg enverra le vote.",
    voteSetupFailedTitle: "Échec de la préparation du vote",
    activatedFluxerDesc: "Votre vote Fluxerlist a été appliqué à ce serveur.",
    voteActivationFailedTitle: "Échec de l'activation du vote",
    groupLimitTitle: "Limite de groupes atteinte",
    groupLimitDesc:
      "Ce serveur a atteint son quota actuel de groupes. {vote} ou abonnez-vous à Orax Plus pour débloquer plus de groupes interserveur.",
    groupLimitDescNoVote:
      " Ce serveur a atteint son quota actuel de groupes. Abonnez-vous à Orax Plus pour débloquer plus de groupes interserveur.",
    transferTitle: "Orax Plus transféré",
    transferDesc: "Votre plan a été déplacé vers le serveur sélectionné.",
    transferFailedTitle: "Échec du transfert",
    transferFailedDesc:
      "Impossible de transférer Orax Plus vers ce serveur. Veuillez réessayer ou contacter l'assistance.",
    activationTimeoutTitle: "L'activation prend plus de temps que prévu",
    activationTimeoutDesc:
      "Orax Plus devrait apparaître sur le serveur sélectionné dans une ou deux minutes. Si ce n'est pas le cas, veuillez actualiser la page ou contacter l'assistance.",
    checkoutFailedTitle: "Échec du paiement",
    applySameTitle: "Appliquer Orax Plus à ce serveur ?",
    applyDifferentTitle:
      "Êtes-vous sûr de vouloir appliquer Orax Plus à ce serveur ?",
    applySubtitle: "Orax Plus a été activé sur {server}.",
    applySubtitleTransfer:
      " Choisissez un autre serveur ci-dessous si vous préférez l'y utiliser.",
    applyTransferLabel: "Transférer vers un autre serveur",
    applyCurrent: "(actuel)",
    applying: "Application…",
    applyContinue: "Continuer",
    applyToServer: "Appliquer à ce serveur",
  },

  groups: {
    ownedTitle: "Groupes possédés",
    emptyTitle: "Ce serveur ne possède aucun groupe.",
    emptyDescPrefix: "Vous pouvez en créer un ou explorer les groupes ",
    emptyDescLink: "ici",
    emptyDescSuffix: ".",
    inviteLink: "Lien d'invitation :",
    noInviteLink: "Aucun lien d'invitation trouvé",
    copied: "Copié !",
    regenerateInvite: "Régénérer le lien d'invitation",
    linkedChannels: "Canaux liés",
    noChannelsTitle: "Aucun canal lié à ce groupe",
    noChannelsDesc:
      "Utilisez ou partagez le lien d'invitation pour commencer à ajouter d'autres canaux",
    suggestFeature: "Suggérer une fonctionnalité",
    docs: "Documentation",
    botMissingTooltip:
      "Le bot n'est plus présent sur ce serveur ou ce canal n'existe plus",
    limitReachedDesc:
      "Ce serveur a atteint sa limite actuelle de groupes. Activez Orax Plus depuis le tableau de bord pour créer plus de groupes.",
  },

  settings: {
    serverTitle: "Paramètres du serveur",
    language: "Langue",
    public: "Public",
    publicInfo: "Votre serveur est public :",
    publicInfoDesc:
      "cela signifie que les membres de votre/vos groupe(s) interserveur(s) pourront rejoindre {server} en utilisant la commande /channel-infos",
    publicLink: "Lien public",
    publicLinkHint: "discord.gg/",
    publicName: "Nom public",
    saveFailedTitle: "Échec de l'enregistrement des paramètres",
    saveFailedDesc:
      "Impossible d'enregistrer vos paramètres. Veuillez réessayer.",
    invalidLink: "Lien invalide",
  },

  groupSettings: {
    settingsTitle: "Paramètres",
    basicConfig: "Configuration de base",
    repliesStyle: "Style des réponses",
    repliesEmbed: "Embed",
    repliesQuote: "Citation (ancien style Discord)",
    repliesQuoteNoButton: "Citation sans bouton de saut",
    repliesEmbedNoButton: "Embed sans bouton de saut",
    allowEveryone: "Autoriser @everyone et @here",
    allowEveryoneDesc:
      "Autoriser les utilisateurs à mentionner @everyone et @here dans l'interserveur.",
    syncMentions: "Synchroniser les mentions de rôle entre serveurs",
    syncMentionsDesc:
      "Autoriser les mentions @Rôle à notifier les rôles correspondants dans les serveurs liés (les noms doivent correspondre exactement).",
    translation: "Traduction",
    translationDesc:
      "Traduire automatiquement les messages synchronisés. La langue cible peut être sélectionnée dans les paramètres de chaque canal.",
    moderationSecurity: "Modération et sécurité",
    moderators: "Modérateurs",
    moderatorsDesc:
      "Par défaut, Orax considère tous les membres ayant la permission « Gérer les messages » comme des modérateurs. Vous pouvez remplacer ce comportement en écrivant une liste de noms d'utilisateur séparés par des virgules.",
    moderatorsPlaceholder:
      "Entrez les noms d'utilisateur séparés par des virgules…",
    blacklist: "Liste noire",
    blacklistDesc:
      "Empêcher les messages contenant certains mots d'être envoyés dans l'interserveur. Séparés par des virgules.",
    blacklistPlaceholder: "Entrez les mots séparés par des virgules…",
    interservRules: "Règles de l'interserveur",
    interservRulesDesc:
      'Ces règles sont affichées aux utilisateurs avec la commande "/rules".',
    interservRulesPlaceholder: "Écrivez les règles de l'interserveur ici…",

    advancedTitle: "Paramètres avancés",
    privacySync: "Confidentialité et synchronisation",
    disableUserWarning:
      "Désactiver le message d'avertissement aux utilisateurs",
    dangerousTitle: "Cela peut être dangereux",
    dangerousDesc:
      "Pour des raisons de confidentialité, il est nécessaire d'avertir les utilisateurs que leurs messages pourraient être synchronisés. Vous pouvez l'ajouter aux règles du serveur, par exemple.",
    customWarningMsg: "Message d'avertissement personnalisé",
    customWarningMsgDesc:
      "Remplace le texte d'avertissement par défaut affiché dans les canaux synchronisés.",
    customWarningMsgPlaceholder:
      "ex., Les messages ici peuvent être partagés entre serveurs.",
    disableDeleteSync:
      "Désactiver la synchronisation de suppression de messages",
    messageFiltering: "Filtrage des messages",
    groupManagement: "Gestion du groupe",
    renameGroup: "Renommer le groupe",
    newGroupNamePlaceholder: "Nouveau nom du groupe",
    deleteGroup: "Supprimer le groupe",
    deleteGroupDesc:
      "Cette action est irréversible. Tous les canaux liés à votre groupe seront déliés.",
    viewMutedUsers: "Voir les utilisateurs muets",
    mutedUsersTitle: "Utilisateurs muets",

    customUsernamesPattern: "Modèle de noms d'utilisateur personnalisés :",
    customUsernamesDesc:
      "Vous pouvez utiliser {username}, {nickname}, {serverName} et {role} pour personnaliser dynamiquement les noms d'utilisateur.",
    customUsernamesPlaceholder: "{username} [{serverName}]",
    customPictureLabel: "URL d'image de profil personnalisée :",
    customPictureDesc:
      "Vous pouvez utiliser {userAvatarUrl} pour personnaliser dynamiquement les photos de profil.",
    customPicturePlaceholder:
      "https://exemple.com/utilisateurs/{userAvatarUrl}",

    logMessagesLabel:
      "Enregistrer les messages interserveur dans le canal suivant :",
    noLog: "Pas de journal (désactivé)",
  },

  filters: {
    title: "Filtres de messages",
    loading: "Chargement des règles de filtre…",
    desc: "Configurez des règles pour filtrer les messages transférés dans l'interserveur. Les messages doivent correspondre à au moins une règle d'inclusion (s'il y en a) et à aucune règle d'exclusion.",
    noRules:
      "Aucune règle de filtre configurée. Tous les messages seront transférés.",
    keyword: "Mot-clé",
    media: "Média",
    author: "Auteur",
    include: "Inclure",
    exclude: "Exclure",
    enterKeywords: "Entrez les mots-clés (séparés par des virgules)",
    selectAuthorType: "Sélectionner le type d'auteur",
    selectMediaType: "Sélectionner le type de média",
    images: "Images",
    videos: "Vidéos",
    attachments: "Fichiers/Pièces jointes",
    links: "Liens",
    embeds: "Intégrés",
    addRule: "+ Ajouter une règle de filtre",
    howItWorks: "Comment ça marche :",
    includeDesc:
      "Seuls les messages correspondant à ces règles seront transférés (s'il n'y a pas de règle d'inclusion, tous les messages passent)",
    excludeDesc:
      "Les messages correspondant à ces règles ne seront jamais transférés",
    keywordsDesc:
      "Mots séparés par des virgules à faire correspondre dans le contenu du message",
    mediaDesc: "Filtrer en fonction des pièces jointes et du type de contenu",
    authorDesc:
      "Filtrer en fonction du type d'auteur du message (humain, webhook ou bot)",
  },

  activityGraph: {
    title: "Graphique d'activité (30 jours)",
    messagesCount: "{count} messages envoyés au cours des 30 derniers jours.",
    seriesName: "Messages envoyés dans l'interserveur",
  },

  channelSettings: {
    backButton: "Paramètres du canal",
    selectOption: "Sélectionner une option",
    channelConfig: "Configuration du canal",
    messageDirection: "Direction des messages",
    messageDirectionDesc:
      "Entrant uniquement : recevoir les messages de l'interserveur, mais ne pas envoyer de messages depuis ce canal vers d'autres. Sortant uniquement : envoyer des messages depuis ce canal vers l'interserveur, mais ne pas recevoir de messages ici.",
    directionAll: "Tous les messages (par défaut)",
    directionIncoming: "Entrant uniquement",
    directionOutgoing: "Sortant uniquement",
    translationLanguage: "Langue de traduction",
    translationLanguageDesc:
      "La traduction automatique est activée, donc tous les messages envoyés vers ce canal seront traduits dans la langue sélectionnée. Besoin d'une autre langue ? N'hésitez pas à contacter l'assistance et nous l'ajouterons pour vous.",
    overrideGroup: "Remplacer les paramètres du groupe",
  },

  createGroup: {
    title: "Créer un nouveau groupe",
    quotaWithPlus: "{owned}/{limit} groupes possédés avec Orax Plus",
    quotaFree: "{owned}/{limit} groupes possédés avec le plan gratuit",
    limitWarning:
      "Ce serveur a atteint sa limite actuelle de groupes. Activez Orax Plus depuis le tableau de bord pour créer plus de groupes.",
    groupNamePlaceholder: "Nom du groupe",
    firstChannel: "Premier canal lié",
    channelLoadFailedTitle: "Échec du chargement des canaux",
    channelLoadFailedDesc:
      "Impossible de charger les canaux du serveur. Veuillez réessayer.",
    validationTitle: "Erreur de validation",
    enterGroupName: "Veuillez entrer un nom de groupe",
    selectChannel: "Veuillez sélectionner un canal",
    manageWebhooksError:
      "Vous devez donner la permission « Gérer les webhooks » au bot",
    groupLimitError:
      "Ce serveur a atteint sa limite de groupes ({owned}/{limit}).",
    unknownError: "Erreur inconnue ; Code d'erreur : {code}",
    customErrorSuffix: "; Erreur personnalisée : {error}",
    creationFailedTitle: "Échec de la création du groupe",
    creationFailedDesc: "Impossible de créer le groupe. Veuillez réessayer.",
    successTitle: "Succès",
    successDesc: "Groupe créé avec succès !",
  },

  mutedUsers: {
    desc: "Gérez les utilisateurs muets dans ce groupe. Utilisez l'icône poubelle pour les réactiver.",
    loading: "Chargement des utilisateurs muets…",
    empty: "Aucun utilisateur n'est actuellement muet.",
    unmutedTitle: "Utilisateur réactivé",
    unmutedDesc: "L'utilisateur a été retiré de la liste des muets.",
    unmuteFailedTitle: "Échec de la réactivation de l'utilisateur",
    unmuteFailedDesc:
      "Impossible de retirer cet utilisateur de la liste des muets. Veuillez réessayer.",
    loadFailedTitle: "Échec du chargement des utilisateurs muets",
    loadFailedDesc:
      "Impossible de récupérer la liste des utilisateurs muets. Veuillez réessayer.",
  },

  serviceLimits: {
    title: "Limites du service",
    desc: "Les serveurs gratuits peuvent posséder jusqu'à 2 groupes et lier jusqu'à 5 canaux par groupe. Orax Plus augmente ce serveur à 100 groupes et 50 canaux par groupe, et débloque la traduction automatique, la livraison prioritaire des messages et la commande '/resync'.",
    ownedGroupsProgress: "{owned}/{limit} groupes possédés",
    channelsProgress: "{name} : {count}/{limit} canaux connectés",
  },

  notifications: {
    loginFailedTitle: "Échec de la connexion",
    loginFailedDesc: "Réponse d'authentification invalide. Redirection…",
    loginFailedRetry:
      "Impossible de terminer l'authentification. Veuillez réessayer.",
    loginFailedPlatformDesc:
      "Nous n'avons pas pu déterminer avec quelle plateforme vous avez essayé de vous connecter.",
    dataLoadFailedTitle: "Échec du chargement des données",
    dataLoadFailedGuilds:
      "Impossible de charger vos serveurs {platform}. Veuillez actualiser la page.",
    dataLoadFailedProfile:
      "Impossible de charger votre profil {platform}. Veuillez actualiser la page.",
    serverDataErrorTitle: "Erreur de données du serveur",
    serverDataErrorDesc:
      "Impossible de charger la configuration du serveur. Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
    checkoutCancelledTitle: "Paiement annulé",
    checkoutCancelledDesc: "Orax Plus n'a pas été activé.",
  },

  vote: {
    topgg: "Voter sur Top.gg",
    fluxerlist: "Voter sur Fluxerlist",
  },

  time: {
    lessThanMinute: "moins d'une minute",
    oneDay: "{count} jour",
    multipleDays: "{count} jours",
    oneHour: "{count} heure",
    multipleHours: "{count} heures",
    oneMinute: "{count} minute",
    multipleMinutes: "{count} minutes",
  },

  siteHeader: {
    brand: "Orax bot",
    pricing: "Tarifs",
    free: "Gratuit",
    login: "Connexion",
    kofiAlt: "Soutenez-moi sur Ko-fi",
  },

  siteFooter: {
    docs: "Documentation",
    tos: "CGU",
    github: "GitHub",
  },

  home: {
    metaTitle:
      "Orax — Synchronisez vos salons entre plusieurs serveurs Discord",
    metaDescription:
      "Orax vous permet de synchroniser les salons entre plusieurs serveurs Discord afin que vos communautés puissent discuter, partager des événements et collaborer sans quitter leur propre serveur.",
    metaKeywords:
      "bot Discord, synchronisation de salons, chat interserveur, intégration Discord, Orax, Interserv, pont entre serveurs",
    ogImageAlt: "Logo Orax",
    brand: "Orax",
    heroTitle:
      "Synchronisez vos salons entre plusieurs serveurs Discord",
    heroDescription:
      "Connectez vos communautés pour qu'elles puissent discuter, partager des événements et collaborer — sans quitter leur propre serveur",
    cta: "Ajouter à Discord",
    scrollToFeatures: "Voir les fonctionnalités",
    feature1Title: "Connectez plusieurs salons entre eux",
    feature1Description:
      "Orax vous permet de synchroniser des salons entre plusieurs serveurs différents, favorisant les discussions entre membres de divers serveurs, les événements, etc., sans forcer tout le monde à rejoindre un serveur spécifique pour échanger.",
    feature2Title: "Comme un vrai chat",
    feature2Description:
      "Tout fonctionne comme dans un salon normal : vous pouvez envoyer, modifier et supprimer des messages, et tout sera répliqué sur les autres serveurs Discord.",
    waveAlt: "Séparateur décoratif en vague",
    syncChannelsAlt:
      "Salons Orax synchronisés affichés côte à côte sur deux serveurs Discord",
    slashCommandAlt: "Exemple de commande slash",
    dashboard: "Tableau de bord",
    resourcesTitle: "Ressources et liens",
    cardDocsTitle: "Documentation →",
    cardDocsDescription:
      "Apprenez à utiliser le bot grâce à notre documentation",
    cardTipTitle: "Soutenir →",
    cardTipDescription:
      "Soutenez mon travail via mon Ko-fi récemment créé ✨",
    cardSupportTitle: "Serveur de support →",
    cardSupportDescription:
      "Une question ? Un problème ? Une suggestion ? Contactez-nous",
    cardExploreTitle: "Explorer →",
    cardExploreDescription: "Découvrez les groupes publics",
    switchLanguage: "Langue",
  },

  pricing: {
    metaTitle: "Tarifs — Orax",
    metaDescription:
      "Orax est gratuit. Débloquez Orax Plus pour augmenter vos limites en votant sur Top.gg, en vous abonnant chaque mois ou en achetant un plan à vie.",
    metaKeywords:
      "tarifs Orax, Orax Plus, bot Discord premium, bot Discord gratuit, vote Top.gg",
    ogImageAlt: "Logo Orax",
    pageTitle: "Tarifs",
    pageSubtitle:
      "Orax est gratuit pour tous. Débloquez Orax Plus pour augmenter les limites de votre serveur — votez gratuitement sur Top.gg, abonnez-vous chaque mois ou achetez un plan à vie.",
    tierFreeName: "Gratuit",
    tierFreeDescription:
      "Tout ce dont vous avez besoin pour commencer à connecter vos communautés.",
    tierFreeFeature1: "Jusqu'à 2 groupes interserveurs par serveur",
    tierFreeFeature2: "Jusqu'à 5 salons synchronisés par groupe",
    tierFreeFeature3: "Support communautaire",
    tierFreeCta: "Ajouter à Discord",
    tierPlusBadge: "Le plus populaire",
    tierPlusName: "Orax Plus",
    tierPlusDescription:
      "Pour les utilisateurs avancés et les grandes communautés qui ont besoin de plus.",
    tierPlusFeature1: "Jusqu'à 100 groupes interserveurs par serveur",
    tierPlusFeature2: "Jusqu'à 50 salons synchronisés par groupe",
    tierPlusFeature3: "Traduction automatique",
    tierPlusFeature4: "Commande /resync",
    tierPlusFeature5: "Livraison prioritaire des messages",
    tierPlusFeature6: "Support prioritaire par e-mail",
    tierPlusCta: "Obtenir Orax Plus",
    freeVoteNotePrefix: "ou obtenez-le",
    freeVoteNoteStrong: "gratuitement",
    freeVoteNoteSuffix: "en votant sur Top.gg",
    fromPrice: "à partir de {price}",
    perMonth: "/ mois",
    waysSectionTitle: "Trois façons d'obtenir Orax Plus",
    waysVoteTitle: "Voter pour débloquer",
    waysVotePrice: "Gratuit",
    waysVoteDescription:
      "Votez une fois par semaine pour Orax sur Top.gg ou Fluxerlist. L'activation est automatique et dure jusqu'à l'expiration de votre vote.",
    waysMonthlyTitle: "Abonnement mensuel",
    waysMonthlyPrice: "{price} / mois",
    waysMonthlyDescription:
      "Un abonnement mensuel récurrent facturé en toute sécurité via Stripe. Annulable à tout moment.",
    waysLifetimeTitle: "À vie",
    waysLifetimePrice: "19,99 $ une fois",
    waysLifetimeDescription:
      "Payez une fois et conservez Orax Plus pour toujours sur ce serveur. Aucun frais récurrent.",
    waysNote:
      "Orax Plus est activé par serveur Discord. Ouvrez le tableau de bord, sélectionnez votre serveur et choisissez la façon dont vous souhaitez le débloquer.",
    faqTitle: "Questions fréquentes",
    faq1Question: "Orax est-il vraiment gratuit ?",
    faq1Answer:
      "Oui. Le plan gratuit vous permet de créer des groupes interserveurs et de synchroniser des salons sans frais. Orax Plus est entièrement optionnel.",
    faq2Question: "Comment fonctionne le vote ?",
    faq2Answer:
      "Les serveurs Discord votent pour Orax sur Top.gg et les serveurs Fluxer votent sur Fluxerlist. Orax Plus s'active automatiquement et reste actif jusqu'à l'expiration du vote — votez à nouveau pour le prolonger.",
    faq3Question: "Puis-je annuler mon abonnement mensuel ?",
    faq3Answer:
      "Absolument. Vous pouvez annuler à tout moment et vous conserverez l'accès jusqu'à la fin de votre période de facturation.",
    faq4Question: "Puis-je obtenir un remboursement ?",
    faq4Answer:
      "Oui. Si vous n'êtes pas satisfait, vous pouvez demander un remboursement complet dans les 15 jours suivant votre achat en contactant le support.",
    faq4SupportLink: "support@oraxbot.com",
    faq5Question: "Orax Plus est-il par serveur ou par compte ?",
    faq5Answer:
      "Orax Plus est activé par serveur Discord. Chaque serveur que vous souhaitez améliorer nécessite son propre plan Orax Plus. Besoin de le déplacer ? Vous pouvez transférer votre Orax Plus vers un autre serveur à tout moment — il suffit de contacter le support.",
    faq5SupportLink: "contacter le support",
    faqMore: "Plus",
    ariaLabelPricing: "Tarifs",
    ariaLabelFreeTier: "Offre gratuite",
    ariaLabelPlusTier: "Offre Orax Plus",
    ariaLabelWays: "Façons d'obtenir Orax Plus",
    ariaLabelFaq: "Questions fréquentes",
  },

  login: {
    metaTitle: "Tableau de bord Orax — Choisissez votre plateforme",
    metaDescription:
      "Connectez-vous au tableau de bord Orax avec Discord ou Fluxer pour gérer vos groupes interserveur.",
    metaKeywords:
      "connexion Orax, connexion Discord, connexion Fluxer, tableau de bord",
    ogImageAlt: "Logo Orax",
    pageTitle: "Bienvenue sur Orax",
    pageSubtitle:
      "Choisissez une plateforme pour accéder à votre tableau de bord",
    newHere: "Nouveau ici ?",
    learnMore: "En savoir plus sur Orax",
    loginWith: "Se connecter avec {platform}",
    loading: "Chargement…",
    exchanging: "Finalisation de la connexion…",
  },
};

export default fr;
