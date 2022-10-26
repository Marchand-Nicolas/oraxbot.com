import styles from '../../styles/Dashboard.module.css'
import config from '../../utils/config'
import { useState, useEffect } from 'react'
import { getCookie, setCookie } from '../../utils/cookies'
import Link from 'next/link'
import PaypalButton from "../../components/PaypalButton" 
import { render } from 'react-dom'
import popup from '../../utils/popup'
import fire from '../../public/icons/fire.svg'
import meteor from '../../public/icons/meteor.svg'
import CreateGroupMenu from '../../components/dashboard/CreateGroupMenu'
import Settings from './settings'

export default function Dashboard() {
    const serverIp = config.serverIp
    const [user, setUser] = useState(undefined)
    const [guilds, setGuilds] = useState([])
    const [guildDatas, setGuildDatas] = useState({})
    const [settings, setSettings] = useState({ lang: 0 })
    const [paymentProgress, setPaymentProgress] = useState(0)
    const [refreshGuildDatas, setRefreshGuildDatas] = useState(false)

    console.log("---")
    useEffect(() => {
        let token = getCookie('token')
        const params = new URLSearchParams(window.location.search)
        const state = params.get("state")
        if (!token || token === 'undefined' || state) {
            const code = params.get("code")
            console.log(state, code)
            if (code) {
                fetch(`${serverIp}login`, { method: 'POST', body : `{ "token": "${code}" }` }).then(res => res.json()).then(res => {
                    console.log(res)
                    if (!res.access_token || res.access_token === 'undefined') {
                        console.log(state)
                        if (state) {
                            window.location.href = state
                            setInterval(() => {
                                window.location.href = state
                            }, 2000);
                        }
                        else window.location.href = '/dashboard'
                    }
                    else {
                        setCookie('token', res.access_token, res.expires_in - 1000)
                        token = res.access_token
                        loadPage()
                    }
                })
            }
            else {
                window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=https%3A%2F%2Foraxbot.com%2Fdashboard&response_type=code&scope=identify%20guilds`
            }
        }
        else {
            loadPage()
        }
        async function loadPage() {
            const userDatas = await (await fetch('https://discordapp.com/api/users/@me', {
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token },
            })).json()
            if (userDatas.message === '401: Unauthorized') {
                setCookie('token', '', 0)
                window.location.href = '/dashboard'
            }
            else {
                setUser(userDatas)
                const guilds = await (await fetch('https://discordapp.com/api/v6/users/@me/guilds', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token },
                })).json()
                if (guilds.retry_after) {
                    setTimeout(() => {
                        window.location.reload();
                    }, guilds.retry_after)
                }
                setGuilds(guilds)
            }
        }
    }, []);

    function imgError(guildId) {
        const guildElement = document.getElementById("guild_" + guildId)
        const img = guildElement.querySelector('img')
        img.src = "/assets/default_guild_icon.jpg"
    }
    function endImgLoading(guildId) {
        const guildElement = document.getElementById("guild_" + guildId)
        guildElement.classList.remove("loading")
    }

    const guildId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("guild") : ""
    let guild = guilds ? guilds.find(guild => guild.id === guildId) : undefined
    
    function checkAdminPerms(guild) {
        // Check if user has admin permission on this guild (https://discord.com/developers/docs/topics/permissions)
        return guild.permissions_new.toString(16) & 0x0000000000000008
    }

    if (!guild) {
        if (guilds.length > 0) {
            guild = guilds.find(guild => checkAdminPerms(guild))
        }
        if (!guild) guild = {
            "id": "",
            "name": "",
            "icon": "",
            "owner": false,
            "permissions": 2147483647,
            "permissions_new": "4398046511103"
        }
    }

    useEffect(() => {
        if (refreshGuildDatas) return setRefreshGuildDatas(false)
        if (!guild) return;
        if (!guild.id) return;
        try {
            fetch(`${serverIp}get_server_datas`, { method: 'POST', body : `{ "guildId": "${guild.id}", "token": "${getCookie('token')}" }` }).then(res => res.json()).then(res => {
                if (res.result) {
                    setGuildDatas(res)
                    setSettings(res.settings)
                }
                else {
                    requestError()
                }
            })
        } catch (error) {
            requestError()
        }
        function requestError() {
            setGuildDatas({})
            popup("Error", `An error occurred.`, "error", {
                content: <p className='content'>
                    It seems that part of our infrastructure is not operational. Please come back later, otherwise some features will not work.
                </p>,
                icon: fire
            })
        }
    }, [guild, paymentProgress, refreshGuildDatas]);
    
    return <>
        <div style={{backgroundImage: guild.icon ? `url('https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96')` : null}} className={styles.background} />
        <nav className={styles.navbar}>
            {
                guilds.length > 0 ? guilds.map(g =>
                    checkAdminPerms(g) ?
                    <Link key={"nav_guild_" + g.id} href={"?guild=" + g.id}>
                        <div id={"guild_" + g.id} className={[styles.navGuild, !document.getElementById("guild_" + g.id) && "loading", guild.id === g.id ? styles.selected : null].join(" ")}>
                            <img className={styles.guildIcon} onLoad={() => endImgLoading(g.id)} onError={() => imgError(g.id)} src={g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=96` : '/assets/default_guild_icon.jpg'} alt={g.name + " (guild icon)"} />
                        </div>
                    </Link> : null
                ) : [...Array(3)].map((o, index) => <div key={"nav_guild_" + index} className={styles.navGuild} >
                <div className={[styles.guildIcon, styles.placeHolder].join(" ")} />
            </div>)
            }
        </nav>
        <div className={styles.page}>
            <h1 className={styles.title}>{guild.name}</h1>
            {/*<a href='/docs' target="_blank" rel="noreferrer">
                <button className={styles.button}>
                    Documentation <strong><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg></strong>
                </button>
        </a>*/}
            <a href='https://discord.gg/PJumX8FjRV' target="_blank" rel="noreferrer">
                <button className={styles.button}>
                    Support <strong><svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288" />
                    </svg>
                    </strong>
                </button>
            </a>
            <br></br>
            {
                guildDatas.bot ? 
                <>
                    <button onClick={() => render(<CreateGroupMenu guildId={guildId} setRefreshGuildDatas={setRefreshGuildDatas} />, document.getElementById('menu'))} className={styles.button}>
                        Create an interserver group
                        <strong>
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
                        </svg>
                        </strong>
                    </button>
                    <br></br>
                    {guildDatas.ownedGroups.length ? <section className={styles.groupContainer}>
                        <h2>Owned groups</h2>
                        {
                            guildDatas.ownedGroups.map(group => <Link key={"ownedGroup_" + group.id} href={`/dashboard/ownedgroup/${group.id}?guild=${guild.id}&icon=${guild.icon}&groupName=${group.name}`}><div className={styles.group}>{group.name}</div></Link>)
                        }
                    </section> : <section className={styles.emptyGroupContainer}><h2>This server does not own any group</h2></section>}
                    <Settings key={"settingsGuild_" + guildId} guildId={guildId} settings={settings} />
                    {/*guildDatas.connectedGroups ? null : <section className={styles.emptyGroupContainer}><h2>This server isn't connected to any group</h2></section>*/}
                </> :
            <button onClick={() => popup("Invite the bot", `Warning`, "warning", {
                content: <p className='content'>
                    It is necessary for Orax to access the content of the messages in order to synchronize them between the channels. By inviting Orax, it will be able to read all the messages of your server.<br></br>
                    For security and privacy reasons, we suggest you to give him the permission to read the messages only in the channels the bot is concerned with.
                </p>,
                icon: meteor,
                action: function() {window.open(config.inviteLink + '&guild_id=' + guild.id)}
            })} className={styles.button}>
                Add bot
                <strong>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </strong>
            </button>
            }
            {
                /*guildDatas ? 
                <>
                    <button className={[styles.button, styles.buyButton, styles.done].join(" ")}>
                        Purchased <strong>10$</strong>
                    </button>
                    <a href="https://discord.com/api/oauth2/authorize?client_id=991022601574973501&permissions=268823632&scope=applications.commands%20bot" target="_blank" rel="noreferrer">
                        <button className={"button round " + styles.inviteBot}>
                            Invite bot
                        </button>
                    </a>
                </> :
                <>
                    <button onClick={() => render(<PaypalButton setPaymentProgress={setPaymentProgress} email={user.email} guildId={guild.id} discordUserId={user.id} />, document.getElementById("container"))} className={[styles.button, styles.buyButton].join(" ")}>
                        Add bot <strong>10$</strong>
                    </button>
                    <a href="https://discord.com/api/oauth2/authorize?client_id=991022601574973501&permissions=268823632&scope=applications.commands%20bot" target="_blank" rel="noreferrer">
                        <button className={[styles.button, styles.buyButton].join(" ")}>
                            Try the bot for free <strong>0$</strong>
                        </button>
                    </a>
                </>*/
            }
            <div id="container" key={guild.id + "_" + paymentProgress}>

            </div>
            <br></br>
        </div>
    </>
}
