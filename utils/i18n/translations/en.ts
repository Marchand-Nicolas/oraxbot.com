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
    subscribe: "Subscribe ${price}/mo",
    lifetime: "Lifetime $19.99",
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
      "By default Orax considers all members with the 'Manage Messages' permission as moderators. You can override this behaviour by writing a list of comma separated usernames.",
    moderatorsPlaceholder: "Enter usernames separated by commas…",
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
};

export default en;
