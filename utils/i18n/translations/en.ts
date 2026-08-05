/**
 * English translations — the source of truth.
 *
 * Every other language file mirrors this exact shape. The `Translation`
 * type is derived from this object so adding a key here automatically
 * requires every language file to provide it.
 */
const en = {
  common: {
    cancel: "Cancel",
    continue: "Continue",
    close: "Close",
    okay: "Okay",
    loading: "Loading…",
    save: "Save",
    create: "Create",
    delete: "Delete",
    rename: "Rename",
    remove: "Remove",
    add: "Add",
    confirm: "Confirm",
    human: "Human",
    bot: "Bot",
    webhook: "Webhook",
  },

  nav: {
    support: "Support",
    tip: "Tip",
    createGroup: "Create an interserver group",
    exploreGroups: "Explore groups",
    inviteBot: "Invite the bot",
    inviteBotWarningTitle: "Warning",
    inviteBotWarningBody:
      "It is necessary for Orax to access the content of the messages in order to synchronize them between channels. By inviting Orax, it will be able to read all the messages of your server.\nFor security and privacy reasons, we suggest you to give it the permission to read the messages only in the channels it is used in.",
    switchPlatform: "Switch platform",
    logout: "Log out",
    user: "User",
  },

  oraxPlus: {
    badgeActive: "Orax Plus",
    badgeFree: "Free plan",
    title: "Orax Plus",
    activeDesc:
      "This server has the extended Orax Plus limits, auto-translate, the /resync command, and priority message delivery.",
    freeDescVote:
      "Vote for free on {provider}, subscribe monthly, or buy lifetime to unlock higher limits, auto-translate, /resync, and priority message delivery.",
    freeDescNoVote:
      "Subscribe monthly or buy lifetime to unlock higher limits, auto-translate, /resync, and priority message delivery.",
    voteExpiresIn:
      "Expires in {time}, vote again to extend your plan.",
    ownedGroups: "owned groups",
    channelsPerGroup: "channels per group",
    subscribe: "Subscribe {price}/mo",
    lifetime: "Lifetime {price}",
    footnotePrefix:
      "15-day refund guarantee. Need to move Orax Plus to another server? ",
    footnoteLink: "Contact support",
    footnoteSuffix: " to transfer it anytime.",
    only: "Orax Plus only",
    requiredTitle: "Orax Plus required",
    requiredDesc:
      "Auto translation is an Orax Plus feature. {vote} or subscribe to Orax Plus to enable automatic translation for this group.",
    requiredDescNoVote:
      " Subscribe to Orax Plus to enable automatic translation for this group.",
    voteNotDetectedTitle: "Vote not detected yet",
    voteNotDetectedDesc:
      "Top.gg may still be processing the vote. Refresh {context} in a moment if Orax Plus does not appear.",
    activatedTitle: "Orax Plus activated",
    activatedExtendedDesc:
      "Your Top.gg vote extended this server's plan.",
    activatedNewDesc: "Your Top.gg vote was applied to this server.",
    activatedTopggDesc: "Your latest Top.gg vote was applied to this server.",
    voteOpenedTitle: "Vote opened",
    voteOpenedDesc:
      "Orax Plus will activate automatically when Top.gg sends the vote.",
    voteSetupFailedTitle: "Vote setup failed",
    activatedFluxerDesc: "Your Fluxerlist vote was applied to this server.",
    voteActivationFailedTitle: "Vote activation failed",
    groupLimitTitle: "Group limit reached",
    groupLimitDesc:
      "This server has reached its current group quota. {vote} or subscribe to Orax Plus to unlock more interserver groups.",
    groupLimitDescNoVote:
      " This server has reached its current group quota. Subscribe to Orax Plus to unlock more interserver groups.",
    transferTitle: "Orax Plus transferred",
    transferDesc: "Your plan has been moved to the selected server.",
    transferFailedTitle: "Transfer failed",
    transferFailedDesc:
      "Unable to transfer Orax Plus to that server. Please try again or contact support.",
    activationTimeoutTitle: "Activation taking longer than expected",
    activationTimeoutDesc:
      "Orax Plus should appear on the selected server within a minute or two. If it doesn't, please refresh the page or contact support.",
    checkoutFailedTitle: "Checkout failed",
    applySameTitle: "Apply Orax Plus to this server?",
    applyDifferentTitle:
      "Are you sure you want to apply Orax Plus to this server?",
    applySubtitle: "Orax Plus was activated on {server}.",
    applySubtitleTransfer: " Pick a different server below if you'd rather use it there.",
    applyTransferLabel: "Transfer to a different server",
    applyCurrent: "(current)",
    applying: "Applying…",
    applyContinue: "Continue",
    applyToServer: "Apply to this server",
  },

  groups: {
    ownedTitle: "Owned groups",
    emptyTitle: "This server does not own any group.",
    emptyDescPrefix: "You can either create one or explore groups ",
    emptyDescLink: "here",
    emptyDescSuffix: ".",
    inviteLink: "Invite link:",
    noInviteLink: "No invitation link found",
    copied: "Copied!",
    regenerateInvite: "Regenerate invite link",
    linkedChannels: "Linked channels",
    noChannelsTitle: "No channels linked to this group",
    noChannelsDesc:
      "Use or share the invite link to start adding more channels",
    suggestFeature: "Suggest a feature",
    docs: "Docs",
    botMissingTooltip:
      "The bot is no longer present on this server or this channel no longer exists",
    limitReachedDesc:
      "This server has reached its current group limit. Activate Orax Plus from the dashboard to create more groups.",
  },

  settings: {
    serverTitle: "Server settings",
    language: "Language",
    public: "Public",
    publicInfo: "Your server is public:",
    publicInfoDesc:
      "this means that members of your interserver group(s) will be able to join {server} using the /channel-infos command",
    publicLink: "Public link",
    publicLinkHint: "discord.gg/",
    publicName: "Public name",
    saveFailedTitle: "Settings Save Failed",
    saveFailedDesc: "Unable to save your settings. Please try again.",
    invalidLink: "Invalid link",
  },

  groupSettings: {
    settingsTitle: "Settings",
    basicConfig: "Basic Configuration",
    repliesStyle: "Replies style",
    repliesEmbed: "Embed",
    repliesQuote: "Quote (Discord's legacy)",
    repliesQuoteNoButton: "Quote without jump button",
    repliesEmbedNoButton: "Embed without jump button",
    allowEveryone: "Allow @everyone and @here",
    allowEveryoneDesc:
      "Allow people to ping @everyone and @here in the interserver.",
    syncMentions: "Sync role mentions across servers",
    syncMentionsDesc:
      "Allow @Role pings to notify matching roles across linked servers (names must exactly match).",
    translation: "Translation",
    translationDesc:
      "Automatically translate synced messages. Target language can be selected in every channel's settings.",
    moderationSecurity: "Moderation & Security",
    moderators: "Moderators",
    moderatorsDesc:
      "By default Orax considers all members with the 'Manage Messages' permission as moderators. You can override this by adding specific users from any server of the group below.",
    addModerator: "Add a moderator",
    moderatorSearchPlaceholder: "Search a user by username…",
    moderatorsEmpty: "No moderators have been added yet.",
    moderatorsLoading: "Loading moderators…",
    moderatorAddedTitle: "Moderator added",
    moderatorAddedDesc: "The user can now run moderator commands.",
    moderatorAddFailedTitle: "Failed to add moderator",
    moderatorAddFailedDesc: "Unable to add this user as a moderator. Please try again.",
    moderatorAddAlreadyTitle: "Already a moderator",
    moderatorAddAlreadyDesc: "This user is already a moderator of the group.",
    moderatorRemovedTitle: "Moderator removed",
    moderatorRemovedDesc: "The user no longer has moderator permissions in this group.",
    moderatorRemoveFailedTitle: "Failed to remove moderator",
    moderatorRemoveFailedDesc: "Unable to remove this moderator. Please try again.",
    moderatorsLoadFailedTitle: "Failed to load moderators",
    moderatorsLoadFailedDesc: "Unable to fetch the moderator list. Please try again.",
    usersLoadFailedTitle: "Failed to load users",
    usersLoadFailedDesc: "Unable to fetch the user list for this group. Please try again.",
    usersEmpty: "No users match your search.",
    usersLoading: "Searching users…",
    blacklist: "Blacklist",
    blacklistDesc:
      "Prevent messages containing certain words from being sent in the interserver. Comma separated.",
    blacklistPlaceholder: "Enter words separated by commas…",
    interservRules: "Interserv rules",
    interservRulesDesc: 'These rules are displayed to users with the "/rules" command.',
    interservRulesPlaceholder: "Write the interserv rules here…",

    advancedTitle: "Advanced Settings",
    privacySync: "Privacy & Synchronization",
    disableUserWarning: "Disable user warning message",
    dangerousTitle: "This could be dangerous",
    dangerousDesc:
      "For privacy reasons, it is necessary to warn users that their messages might be synchronised. You can add this to the server rules, for example.",
    customWarningMsg: "Custom warning message",
    customWarningMsgDesc:
      "Override the default user warning text shown in synced channels.",
    customWarningMsgPlaceholder:
      "e.g., Messages here may be shared across servers.",
    disableDeleteSync: "Disable message deletion sync",
    messageFiltering: "Message Filtering",
    groupManagement: "Group Management",
    renameGroup: "Rename the group",
    newGroupNamePlaceholder: "New group name",
    deleteGroup: "Delete the group",
    deleteGroupDesc:
      "This action is irreversible. All channels linked to your group will be unlinked.",
    viewMutedUsers: "View muted users",
    mutedUsersTitle: "Muted users",

    customUsernamesPattern: "Custom usernames pattern:",
    customUsernamesDesc:
      "You can use {username}, {nickname}, {serverName} and {role} to customize the usernames dynamically.",
    customUsernamesPlaceholder: "{username} [{serverName}]",
    customPictureLabel: "Custom user picture url:",
    customPictureDesc:
      "You can use {userAvatarUrl} to customize the profile pictures dynamically.",
    customPicturePlaceholder: "https://example.com/users/{userAvatarUrl}",

    logMessagesLabel: "Log interserv messages in the following channel:",
    noLog: "No log (disabled)",
  },

  filters: {
    title: "Message Filters",
    loading: "Loading filter rules…",
    desc: "Configure rules to filter which messages are forwarded in the interserver. Messages must match at least one include rule (if any) and no exclude rules.",
    noRules: "No filter rules configured. All messages will be forwarded.",
    keyword: "Keyword",
    media: "Media",
    author: "Author",
    include: "Include",
    exclude: "Exclude",
    enterKeywords: "Enter keywords (comma separated)",
    selectAuthorType: "Select author type",
    selectMediaType: "Select media type",
    images: "Images",
    videos: "Videos",
    attachments: "Files/Attachments",
    links: "Links",
    embeds: "Embeds",
    addRule: "+ Add Filter Rule",
    howItWorks: "How it works:",
    includeDesc:
      "Only messages matching these rules will be forwarded (if no include rules, all messages pass)",
    excludeDesc: "Messages matching these rules will never be forwarded",
    keywordsDesc: "Comma-separated words to match in message content",
    mediaDesc: "Filter based on message attachments and content type",
    authorDesc:
      "Filter based on the message author type (human, webhook, or bot)",
  },

  activityGraph: {
    title: "Activity graph (30 days)",
    messagesCount: "{count} messages sent in the last 30 days.",
    seriesName: "Messages sent in the interserv",
  },

  channelSettings: {
    backButton: "Channel settings",
    selectOption: "Select an option",
    channelConfig: "Channel configuration",
    messageDirection: "Message direction",
    messageDirectionDesc:
      "Incoming only: receive messages from the interserver, but do not send messages from this channel to others. Outgoing only: send messages from this channel to the interserver, but do not receive messages here.",
    directionAll: "All messages (default)",
    directionIncoming: "Incoming only",
    directionOutgoing: "Outgoing only",
    translationLanguage: "Translation language",
    translationLanguageDesc:
      "Auto translate is enabled, so all messages sent to this channel will be translated to the selected language. Need another language? Don't hesitate to contact support and we'll add it for you.",
    overrideGroup: "Override group settings",
  },

  createGroup: {
    title: "Create a new group",
    quotaWithPlus: "{owned}/{limit} owned groups with Orax Plus",
    quotaFree: "{owned}/{limit} owned groups on the free plan",
    limitWarning:
      "This server has reached its current group limit. Activate Orax Plus from the dashboard to create more groups.",
    groupNamePlaceholder: "Group name",
    firstChannel: "First linked channel",
    channelLoadFailedTitle: "Channel Loading Failed",
    channelLoadFailedDesc: "Unable to load server channels. Please try again.",
    validationTitle: "Validation Error",
    enterGroupName: "Please enter a group name",
    selectChannel: "Please select a channel",
    manageWebhooksError:
      'You must give the "Manage Webhooks" permission to the bot',
    groupLimitError:
      "This server has reached its group limit ({owned}/{limit}).",
    unknownError: "Unknown error; Error code: {code}",
    customErrorSuffix: "; Custom error: {error}",
    creationFailedTitle: "Group Creation Failed",
    creationFailedDesc: "Unable to create group. Please try again.",
    successTitle: "Success",
    successDesc: "Group created successfully!",
  },

  mutedUsers: {
    desc: "Manage the users muted in this group. Use the trash icon to unmute them.",
    loading: "Loading muted users…",
    empty: "No users are currently muted.",
    unmutedTitle: "User unmuted",
    unmutedDesc: "The user has been removed from the mute list.",
    unmuteFailedTitle: "Failed to unmute user",
    unmuteFailedDesc:
      "Unable to remove that user from the mute list. Please try again.",
    loadFailedTitle: "Failed to load muted users",
    loadFailedDesc: "Unable to fetch the muted user list. Please try again.",
  },

  serviceLimits: {
    title: "Service limits",
    desc: "Free servers can own up to 2 groups and link up to 5 channels per group. Orax Plus raises this server to 100 groups and 50 channels per group, and unlocks auto-translate, priority message delivery, and the '/resync' command.",
    ownedGroupsProgress: "{owned}/{limit} owned groups",
    channelsProgress: "{name} : {count}/{limit} connected channels",
  },

  notifications: {
    loginFailedTitle: "Login Failed",
    loginFailedDesc: "Invalid authentication response. Redirecting…",
    loginFailedRetry: "Unable to complete authentication. Please try again.",
    loginFailedPlatformDesc:
      "We could not determine which platform you tried to log in with.",
    dataLoadFailedTitle: "Data Loading Failed",
    dataLoadFailedGuilds:
      "Unable to load your {platform} guilds. Please try refreshing the page.",
    dataLoadFailedProfile:
      "Unable to load your {platform} profile. Please try refreshing the page.",
    serverDataErrorTitle: "Server Data Error",
    serverDataErrorDesc:
      "Unable to load server configuration. Some features may not work properly.",
    checkoutCancelledTitle: "Checkout cancelled",
    checkoutCancelledDesc: "Orax Plus was not activated.",
  },

  vote: {
    topgg: "Vote on Top.gg",
    fluxerlist: "Vote on Fluxerlist",
  },

  time: {
    lessThanMinute: "less than a minute",
    oneDay: "{count} day",
    multipleDays: "{count} days",
    oneHour: "{count} hour",
    multipleHours: "{count} hours",
    oneMinute: "{count} minute",
    multipleMinutes: "{count} minutes",
  },

  siteHeader: {
    brand: "Orax bot",
    pricing: "Pricing",
    free: "Free",
    login: "Login",
    kofiAlt: "Buy Me a Coffee at ko-fi.com",
  },

  siteFooter: {
    docs: "Docs",
    tos: "TOS",
    github: "GitHub",
  },

  home: {
    metaTitle: "Orax — Sync Discord Channels Across Multiple Servers",
    metaDescription:
      "Orax lets you sync channels between multiple Discord servers so communities can chat, share events, and collaborate without leaving their own server.",
    metaKeywords:
      "Discord bot, channel sync, cross-server chat, Discord integration, Orax, Interserv, server bridge",
    ogImageAlt: "Orax logo",
    brand: "Orax",
    heroTitle: "Sync your channels across multiple Discord servers",
    heroDescription:
      "Connect your communities together so they can chat, share events, and collaborate — without leaving their own server",
    cta: "Add to Discord",
    scrollToFeatures: "Scroll to features",
    feature1Title: "Connect multiple channels together",
    feature1Description:
      "Orax allows you to sync channels between multiple different servers, allowing great discussions of people from other servers, events, etc... without forcing everyone to join a specific server to discuss with each other.",
    feature2Title: "Like a real chat",
    feature2Description:
      "Everything works as in a normal channel, you can send, modify, delete messages, and all this will be replicated on other Discord servers.",
    waveAlt: "Decorative wave divider",
    syncChannelsAlt:
      "Orax synced channels shown side by side across two Discord servers",
    slashCommandAlt: "Slash command example",
    dashboard: "Dashboard",
    resourcesTitle: "Resources and links",
    cardDocsTitle: "Docs →",
    cardDocsDescription:
      "Learn how to use the bot with our documentation",
    cardTipTitle: "Tip →",
    cardTipDescription:
      "Support my hard work with my recently launched Ko-fi ✨",
    cardSupportTitle: "Support server →",
    cardSupportDescription:
      "Any questions? A problem? A suggestion? Contact us",
    cardExploreTitle: "Explore →",
    cardExploreDescription: "Discover public groups",
    switchLanguage: "Language",
  },

  pricing: {
    metaTitle: "Pricing — Orax",
    metaDescription:
      "Orax is free to use. Unlock Orax Plus for higher limits by voting on Top.gg, subscribing monthly, or buying a lifetime plan.",
    metaKeywords:
      "Orax pricing, Orax Plus, Discord bot premium, free Discord bot, Top.gg vote",
    ogImageAlt: "Orax logo",
    pageTitle: "Pricing",
    pageSubtitle:
      "Orax is free to use for everyone. Unlock Orax Plus to raise your server's limits — vote for free on Top.gg, subscribe monthly, or buy a lifetime plan.",
    tierFreeName: "Free",
    tierFreeDescription:
      "Everything you need to get started connecting your communities.",
    tierFreeFeature1: "Up to 2 interserver groups per server",
    tierFreeFeature2: "Up to 5 synced channels per group",
    tierFreeFeature3: "Community support",
    tierFreeCta: "Add to Discord",
    tierPlusBadge: "Most popular",
    tierPlusName: "Orax Plus",
    tierPlusDescription: "For power users and large communities that need more.",
    tierPlusFeature1: "Up to 100 interserver groups per server",
    tierPlusFeature2: "Up to 50 synced channels per group",
    tierPlusFeature3: "Auto-translate feature",
    tierPlusFeature4: "/resync command",
    tierPlusFeature5: "Priority message delivery",
    tierPlusFeature6: "Priority email support",
    tierPlusCta: "Get Orax Plus",
    freeVoteNotePrefix: "or get it",
    freeVoteNoteStrong: "free",
    freeVoteNoteSuffix: "by voting on Top.gg",
    fromPrice: "from {price}",
    perMonth: "/ mo",
    waysSectionTitle: "Three ways to get Orax Plus",
    waysVoteTitle: "Vote to unlock",
    waysVotePrice: "Free",
    waysVoteDescription:
      "Vote once a week for Orax on Top.gg or Fluxerlist. Activation is automatic and lasts until your vote expires.",
    waysMonthlyTitle: "Monthly subscription",
    waysMonthlyPrice: "{price} / month",
    waysMonthlyDescription:
      "A recurring monthly subscription billed securely through Stripe. Cancel anytime.",
    waysLifetimeTitle: "Lifetime",
    waysLifetimePrice: "{price} once",
    waysLifetimeDescription:
      "Pay once and keep Orax Plus forever for this server. No recurring charges.",
    waysNote:
      "Orax Plus is activated per Discord server. Open the dashboard, select your server, and choose how you'd like to unlock it.",
    faqTitle: "Frequently asked questions",
    faq1Question: "Is Orax really free?",
    faq1Answer:
      "Yes. The free plan lets you create interserver groups and sync channels at no cost. Orax Plus is completely optional.",
    faq2Question: "How does voting work?",
    faq2Answer:
      "Discord servers vote for Orax on Top.gg and Fluxer servers vote on Fluxerlist. Orax Plus activates automatically and stays active until the vote expires — just vote again to extend it.",
    faq3Question: "Can I cancel my monthly subscription?",
    faq3Answer:
      "Absolutely. You can cancel whenever you like and you will keep access until the end of your billing period.",
    faq4Question: "Can I get a refund?",
    faq4Answer:
      "Yes. If you're not satisfied, you can request a full refund within 15 days of your purchase by contacting support.",
    faq4SupportLink: "support@oraxbot.com",
    faq5Question: "Is Orax Plus per server or per account?",
    faq5Answer:
      "Orax Plus is activated per Discord server. Each server you want to upgrade needs its own Orax Plus plan. Need to move it elsewhere? You can transfer your Orax Plus to another server anytime — just contact support.",
    faq5SupportLink: "contact support",
    faqMore: "More",
    ariaLabelPricing: "Pricing",
    ariaLabelFreeTier: "Free tier",
    ariaLabelPlusTier: "Orax Plus tier",
    ariaLabelWays: "Ways to get Orax Plus",
    ariaLabelFaq: "Frequently asked questions",
  },

  login: {
    metaTitle: "Orax Dashboard — Choose your platform",
    metaDescription:
      "Sign in to the Orax dashboard with Discord or Fluxer to manage your interserver groups.",
    metaKeywords:
      "Orax login, Discord login, Fluxer login, dashboard sign in",
    ogImageAlt: "Orax logo",
    pageTitle: "Welcome to Orax",
    pageSubtitle: "Choose a platform to access your dashboard",
    newHere: "New here?",
    learnMore: "Learn more about Orax",
    loginWith: "Login with {platform}",
    loading: "Loading…",
    exchanging: "Completing sign-in…",
  },
};

export default en;
