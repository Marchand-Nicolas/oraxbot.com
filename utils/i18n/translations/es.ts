import type { Translation } from "../types";

const es: Translation = {
  common: {
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Cerrar",
    okay: "Vale",
    loading: "Cargando…",
    save: "Guardar",
    create: "Crear",
    delete: "Eliminar",
    rename: "Renombrar",
    remove: "Quitar",
    confirm: "Confirmar",
    human: "Humano",
    bot: "Bot",
    webhook: "Webhook",
  },

  nav: {
    support: "Soporte",
    tip: "Propina",
    createGroup: "Crear un grupo interservidor",
    exploreGroups: "Explorar grupos",
    inviteBot: "Invitar al bot",
    inviteBotWarningTitle: "Advertencia",
    inviteBotWarningBody:
      "Es necesario que Orax acceda al contenido de los mensajes para sincronizarlos entre canales. Al invitar a Orax, podrá leer todos los mensajes de tu servidor.\nPor razones de seguridad y privacidad, te sugerimos darle permiso para leer los mensajes solo en los canales donde se usa.",
    switchPlatform: "Cambiar plataforma",
    logout: "Cerrar sesión",
    user: "Usuario",
  },

  oraxPlus: {
    badgeActive: "Orax Plus",
    badgeFree: "Plan gratuito",
    title: "Orax Plus",
    activeDesc:
      "Este servidor tiene los límites ampliados de Orax Plus, traducción automática, el comando /resync y entrega prioritaria de mensajes.",
    freeDescVote:
      "Vota gratis en {provider}, suscríbete mensualmente o compra de por vida para desbloquear límites más altos, traducción automática, /resync y entrega prioritaria de mensajes.",
    freeDescNoVote:
      "Suscríbete mensualmente o compra de por vida para desbloquear límites más altos, traducción automática, /resync y entrega prioritaria de mensajes.",
    voteExpiresIn: "Expira en {time}, vuelve a votar para extender tu plan.",
    ownedGroups: "grupos propios",
    channelsPerGroup: "canales por grupo",
    subscribe: "Suscribirse ${price}/mes",
    lifetime: "De por vida $19.99",
    footnotePrefix:
      "Garantía de reembolso de 15 días. ¿Necesitas mover Orax Plus a otro servidor? ",
    footnoteLink: "Contacta con soporte",
    footnoteSuffix: " para transferirlo en cualquier momento.",
    only: "Solo Orax Plus",
    requiredTitle: "Se requiere Orax Plus",
    requiredDesc:
      "La traducción automática es una función de Orax Plus. {vote} o suscríbete a Orax Plus para activar la traducción automática de este grupo.",
    requiredDescNoVote:
      " Suscríbete a Orax Plus para activar la traducción automática de este grupo.",
    voteNotDetectedTitle: "Voto aún no detectado",
    voteNotDetectedDesc:
      "Top.gg puede estar procesando el voto. Actualiza {context} en un momento si Orax Plus no aparece.",
    activatedTitle: "Orax Plus activado",
    activatedExtendedDesc: "Tu voto en Top.gg ha extendido el plan de este servidor.",
    activatedNewDesc: "Tu voto en Top.gg se ha aplicado a este servidor.",
    activatedTopggDesc: "Tu último voto en Top.gg se ha aplicado a este servidor.",
    voteOpenedTitle: "Voto abierto",
    voteOpenedDesc:
      "Orax Plus se activará automáticamente cuando Top.gg envíe el voto.",
    voteSetupFailedTitle: "Error al preparar el voto",
    activatedFluxerDesc: "Tu voto en Fluxerlist se ha aplicado a este servidor.",
    voteActivationFailedTitle: "Error de activación del voto",
    groupLimitTitle: "Límite de grupos alcanzado",
    groupLimitDesc:
      "Este servidor ha alcanzado su cuota actual de grupos. {vote} o suscríbete a Orax Plus para desbloquear más grupos interservidor.",
    groupLimitDescNoVote:
      " Este servidor ha alcanzado su cuota actual de grupos. Suscríbete a Orax Plus para desbloquear más grupos interservidor.",
    transferTitle: "Orax Plus transferido",
    transferDesc: "Tu plan ha sido trasladado al servidor seleccionado.",
    transferFailedTitle: "Transferencia fallida",
    transferFailedDesc:
      "No se pudo transferir Orax Plus a ese servidor. Inténtalo de nuevo o contacta con soporte.",
    activationTimeoutTitle: "La activación está tardando más de lo esperado",
    activationTimeoutDesc:
      "Orax Plus debería aparecer en el servidor seleccionado en uno o dos minutos. Si no es así, actualiza la página o contacta con soporte.",
    checkoutFailedTitle: "Error en el pago",
    applySameTitle: "¿Aplicar Orax Plus a este servidor?",
    applyDifferentTitle:
      "¿Estás seguro de que quieres aplicar Orax Plus a este servidor?",
    applySubtitle: "Orax Plus fue activado en {server}.",
    applySubtitleTransfer:
      " Elige otro servidor abajo si prefieres usarlo allí.",
    applyTransferLabel: "Transferir a otro servidor",
    applyCurrent: "(actual)",
    applying: "Aplicando…",
    applyContinue: "Continuar",
    applyToServer: "Aplicar a este servidor",
  },

  groups: {
    ownedTitle: "Grupos propios",
    emptyTitle: "Este servidor no tiene ningún grupo.",
    emptyDescPrefix: "Puedes crear uno o explorar grupos ",
    emptyDescLink: "aquí",
    emptyDescSuffix: ".",
    inviteLink: "Enlace de invitación:",
    noInviteLink: "No se ha encontrado ningún enlace de invitación",
    copied: "¡Copiado!",
    regenerateInvite: "Regenerar enlace de invitación",
    linkedChannels: "Canales vinculados",
    noChannelsTitle: "No hay canales vinculados a este grupo",
    noChannelsDesc:
      "Usa o comparte el enlace de invitación para empezar a añadir más canales",
    suggestFeature: "Sugerir una función",
    docs: "Documentación",
    botMissingTooltip:
      "El bot ya no está presente en este servidor o este canal ya no existe",
    limitReachedDesc:
      "Este servidor ha alcanzado su límite actual de grupos. Activa Orax Plus desde el panel para crear más grupos.",
  },

  settings: {
    serverTitle: "Configuración del servidor",
    language: "Idioma",
    public: "Público",
    publicInfo: "Tu servidor es público:",
    publicInfoDesc:
      "esto significa que los miembros de tu(s) grupo(s) interservidor(es) podrán unirse a {server} usando el comando /channel-infos",
    publicLink: "Enlace público",
    publicLinkHint: "discord.gg/",
    publicName: "Nombre público",
    saveFailedTitle: "Error al guardar la configuración",
    saveFailedDesc: "No se pudieron guardar tus ajustes. Inténtalo de nuevo.",
    invalidLink: "Enlace no válido",
  },

  groupSettings: {
    settingsTitle: "Ajustes",
    basicConfig: "Configuración básica",
    repliesStyle: "Estilo de respuestas",
    repliesEmbed: "Embed",
    repliesQuote: "Cita (estilo antiguo de Discord)",
    repliesQuoteNoButton: "Cita sin botón de salto",
    repliesEmbedNoButton: "Embed sin botón de salto",
    allowEveryone: "Permitir @everyone y @here",
    allowEveryoneDesc:
      "Permitir que las personas mencionen a @everyone y @here en el interservidor.",
    syncMentions: "Sincronizar menciones de rol entre servidores",
    syncMentionsDesc:
      "Permitir que las menciones @Rol notifiquen a los roles coincidentes en los servidores vinculados (los nombres deben coincidir exactamente).",
    translation: "Traducción",
    translationDesc:
      "Traducir automáticamente los mensajes sincronizados. El idioma de destino se puede seleccionar en los ajustes de cada canal.",
    moderationSecurity: "Moderación y seguridad",
    moderators: "Moderadores",
    moderatorsDesc:
      "Por defecto, Orax considera moderadores a todos los miembros con el permiso 'Gestionar mensajes'. Puedes anular este comportamiento escribiendo una lista de nombres de usuario separados por comas.",
    moderatorsPlaceholder: "Introduce nombres de usuario separados por comas…",
    blacklist: "Lista negra",
    blacklistDesc:
      "Evitar que los mensajes que contengan ciertas palabras se envíen en el interservidor. Separados por comas.",
    blacklistPlaceholder: "Introduce palabras separadas por comas…",
    interservRules: "Reglas del interservidor",
    interservRulesDesc:
      'Estas reglas se muestran a los usuarios con el comando "/rules".',
    interservRulesPlaceholder: "Escribe aquí las reglas del interservidor…",

    advancedTitle: "Ajustes avanzados",
    privacySync: "Privacidad y sincronización",
    disableUserWarning: "Desactivar mensaje de advertencia al usuario",
    dangerousTitle: "Esto podría ser peligroso",
    dangerousDesc:
      "Por razones de privacidad, es necesario advertir a los usuarios que sus mensajes podrían ser sincronizados. Puedes añadir esto a las reglas del servidor, por ejemplo.",
    customWarningMsg: "Mensaje de advertencia personalizado",
    customWarningMsgDesc:
      "Anula el texto de advertencia al usuario que se muestra en los canales sincronizados.",
    customWarningMsgPlaceholder:
      "p. ej., Los mensajes aquí pueden compartirse entre servidores.",
    disableDeleteSync: "Desactivar sincronización de eliminación de mensajes",
    messageFiltering: "Filtrado de mensajes",
    groupManagement: "Gestión del grupo",
    renameGroup: "Renombrar el grupo",
    newGroupNamePlaceholder: "Nuevo nombre del grupo",
    deleteGroup: "Eliminar el grupo",
    deleteGroupDesc:
      "Esta acción es irreversible. Todos los canales vinculados a tu grupo serán desvinculados.",
    viewMutedUsers: "Ver usuarios silenciados",
    mutedUsersTitle: "Usuarios silenciados",

    customUsernamesPattern: "Patrón de nombres de usuario personalizados:",
    customUsernamesDesc:
      "Puedes usar {username}, {nickname}, {serverName} y {role} para personalizar los nombres de usuario dinámicamente.",
    customUsernamesPlaceholder: "{username} [{serverName}]",
    customPictureLabel: "URL de imagen de usuario personalizada:",
    customPictureDesc:
      "Puedes usar {userAvatarUrl} para personalizar las fotos de perfil dinámicamente.",
    customPicturePlaceholder: "https://ejemplo.com/usuarios/{userAvatarUrl}",

    logMessagesLabel:
      "Registrar mensajes del interservidor en el siguiente canal:",
    noLog: "Sin registro (desactivado)",
  },

  filters: {
    title: "Filtros de mensajes",
    loading: "Cargando reglas de filtro…",
    desc: "Configura reglas para filtrar qué mensajes se reenvían en el interservidor. Los mensajes deben coincidir con al menos una regla de inclusión (si las hay) y con ninguna regla de exclusión.",
    noRules:
      "No hay reglas de filtro configuradas. Todos los mensajes serán reenviados.",
    keyword: "Palabra clave",
    media: "Multimedia",
    author: "Autor",
    include: "Incluir",
    exclude: "Excluir",
    enterKeywords: "Introduce palabras clave (separadas por comas)",
    selectAuthorType: "Seleccionar tipo de autor",
    selectMediaType: "Seleccionar tipo de multimedia",
    images: "Imágenes",
    videos: "Vídeos",
    attachments: "Archivos/Adjuntos",
    links: "Enlaces",
    embeds: "Incrustados",
    addRule: "+ Añadir regla de filtro",
    howItWorks: "Cómo funciona:",
    includeDesc:
      "Solo se reenviarán los mensajes que coincidan con estas reglas (si no hay reglas de inclusión, todos los mensajes pasan)",
    excludeDesc:
      "Los mensajes que coincidan con estas reglas nunca serán reenviados",
    keywordsDesc:
      "Palabras separadas por comas para coincidir en el contenido del mensaje",
    mediaDesc:
      "Filtrar basándose en los archivos adjuntos del mensaje y el tipo de contenido",
    authorDesc:
      "Filtrar basándose en el tipo de autor del mensaje (humano, webhook o bot)",
  },

  activityGraph: {
    title: "Gráfico de actividad (30 días)",
    messagesCount: "{count} mensajes enviados en los últimos 30 días.",
    seriesName: "Mensajes enviados en el interservidor",
  },

  channelSettings: {
    backButton: "Ajustes del canal",
    selectOption: "Selecciona una opción",
    channelConfig: "Configuración del canal",
    messageDirection: "Dirección de los mensajes",
    messageDirectionDesc:
      "Solo entrada: recibir mensajes del interservidor, pero no enviar mensajes desde este canal a otros. Solo salida: enviar mensajes desde este canal al interservidor, pero no recibir mensajes aquí.",
    directionAll: "Todos los mensajes (predeterminado)",
    directionIncoming: "Solo entrada",
    directionOutgoing: "Solo salida",
    translationLanguage: "Idioma de traducción",
    translationLanguageDesc:
      "La traducción automática está activada, por lo que todos los mensajes enviados a este canal se traducirán al idioma seleccionado. ¿Necesitas otro idioma? No dudes en contactar con soporte y lo añadiremos para ti.",
    overrideGroup: "Anular ajustes del grupo",
  },

  createGroup: {
    title: "Crear un nuevo grupo",
    quotaWithPlus: "{owned}/{limit} grupos propios con Orax Plus",
    quotaFree: "{owned}/{limit} grupos propios en el plan gratuito",
    limitWarning:
      "Este servidor ha alcanzado su límite actual de grupos. Activa Orax Plus desde el panel para crear más grupos.",
    groupNamePlaceholder: "Nombre del grupo",
    firstChannel: "Primer canal vinculado",
    channelLoadFailedTitle: "Error al cargar canales",
    channelLoadFailedDesc:
      "No se pudieron cargar los canales del servidor. Inténtalo de nuevo.",
    validationTitle: "Error de validación",
    enterGroupName: "Por favor, introduce un nombre de grupo",
    selectChannel: "Por favor, selecciona un canal",
    manageWebhooksError:
      'Debes dar el permiso "Gestionar webhooks" al bot',
    groupLimitError:
      "Este servidor ha alcanzado su límite de grupos ({owned}/{limit}).",
    unknownError: "Error desconocido; Código de error: {code}",
    customErrorSuffix: "; Error personalizado: {error}",
    creationFailedTitle: "Error al crear el grupo",
    creationFailedDesc: "No se pudo crear el grupo. Inténtalo de nuevo.",
    successTitle: "Éxito",
    successDesc: "¡Grupo creado con éxito!",
  },

  mutedUsers: {
    desc: "Gestiona los usuarios silenciados en este grupo. Usa el icono de papelera para dejar de silenciarlos.",
    loading: "Cargando usuarios silenciados…",
    empty: "Actualmente no hay usuarios silenciados.",
    unmutedTitle: "Usuario no silenciado",
    unmutedDesc: "El usuario ha sido eliminado de la lista de silenciados.",
    unmuteFailedTitle: "Error al dejar de silenciar al usuario",
    unmuteFailedDesc:
      "No se pudo eliminar a ese usuario de la lista de silenciados. Inténtalo de nuevo.",
    loadFailedTitle: "Error al cargar usuarios silenciados",
    loadFailedDesc:
      "No se pudo obtener la lista de usuarios silenciados. Inténtalo de nuevo.",
  },

  serviceLimits: {
    title: "Límites del servicio",
    desc: "Los servidores gratuitos pueden tener hasta 2 grupos y vincular hasta 5 canales por grupo. Orax Plus aumenta este servidor a 100 grupos y 50 canales por grupo, y desbloquea traducción automática, entrega prioritaria de mensajes y el comando '/resync'.",
    ownedGroupsProgress: "{owned}/{limit} grupos propios",
    channelsProgress: "{name} : {count}/{limit} canales conectados",
  },

  notifications: {
    loginFailedTitle: "Error de inicio de sesión",
    loginFailedDesc: "Respuesta de autenticación no válida. Redirigiendo…",
    loginFailedRetry:
      "No se pudo completar la autenticación. Inténtalo de nuevo.",
    dataLoadFailedTitle: "Error al cargar datos",
    dataLoadFailedGuilds:
      "No se pudieron cargar tus servidores de {platform}. Intenta actualizar la página.",
    dataLoadFailedProfile:
      "No se pudo cargar tu perfil de {platform}. Intenta actualizar la página.",
    serverDataErrorTitle: "Error de datos del servidor",
    serverDataErrorDesc:
      "No se pudo cargar la configuración del servidor. Algunas funciones pueden no funcionar correctamente.",
    checkoutCancelledTitle: "Pago cancelado",
    checkoutCancelledDesc: "Orax Plus no fue activado.",
  },

  vote: {
    topgg: "Votar en Top.gg",
    fluxerlist: "Votar en Fluxerlist",
  },

  time: {
    lessThanMinute: "menos de un minuto",
    oneDay: "{count} día",
    multipleDays: "{count} días",
    oneHour: "{count} hora",
    multipleHours: "{count} horas",
    oneMinute: "{count} minuto",
    multipleMinutes: "{count} minutos",
  },
};

export default es;
