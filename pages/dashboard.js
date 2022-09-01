import styles from '../styles/Dashboard.module.css'
import config from '../utils/config'
import { useState, useEffect } from 'react'
import { getCookie, setCookie } from '../utils/cookies'
import Link from 'next/link'
import PaypalButton from "../components/PaypalButton" 
import { render } from 'react-dom'
import popup from '../utils/popup'
import fire from '../public/icons/fire.svg'
import meteor from '../public/icons/meteor.svg'

export default function Dashboard() {
    const serverIp = config.serverIp
    const [user, setUser] = useState(undefined)
    const [guilds, setGuilds] = useState([])
    const [guildStatus, setGuildStatus] = useState(0)
    const [paymentProgress, setPaymentProgress] = useState(0)
    useEffect(() => {
        let token = getCookie('token')
        if (!token || token === 'undefined') {
            const code = new URLSearchParams(window.location.search).get("code")
            if (code) {
                fetch(`${serverIp}login`, { method: 'POST', body : `{ "token": "${code}" }` }).then(res => res.json()).then(res => {
                    if (!res.access_token || res.access_token === 'undefined') {
                        window.location.href = '/dashboard'
                    }
                    else {
                        setCookie('token', res.access_token, res.expires_in - 1000)
                        token = res.access_token
                        loadPage()
                    }
                })
            }
            else {
                window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=https://oraxbot.com/dashboard&response_type=code&scope=identify%20email%20guilds`
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

    const currentGuildId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("guild") : ""
    let guild = guilds.find(guild => guild.id === currentGuildId)
    
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
        if (!guild) return;
        if (!guild.id) return;
        try {
            fetch(`${serverIp}status`, { method: 'POST', body : `{ "guildId": "${guild.id}" }` }).then(res => res.json()).then(res => {
                if (res.result) {
                    setGuildStatus(res.status)
                }
                else {
                    requestError()
                }
            })
        } catch (error) {
            requestError()
        }
        function requestError() {
            setGuildStatus(0)
            popup("Error", `An error occurred.`, "error", {
                content: <p className='content'>
                    It seems that part of our infrastructure is not operational. Please come back later, otherwise some features will not work.
                </p>,
                icon: fire
            })
        }
    }, [guild, paymentProgress]);

    return <>
        <div style={{backgroundImage: guild.icon ? `url('https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96')` : null}} className={styles.background} />
        <nav className={styles.navbar}>
            {
                guilds.length > 0 ? guilds.map(g =>
                    checkAdminPerms(g) ?
                    <Link key={"nav_guild_" + g.id} href={"?guild=" + g.id}>
                        <div id={"guild_" + g.id} className={[styles.navGuild, !document.getElementById("guild_" + g.id) && "loading", guild.id === g.id ? styles.selected : null].join(" ")}>
                            <img className={styles.guildIcon} onLoad={() => endImgLoading(g.id)} onError={() => imgError(g.id)} src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=96`} alt={g.name + " (guild icon)"} />
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
                    Support <strong><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    </strong>
                </button>
            </a>
            <button onClick={() => popup("Invite the bot", `Warning`, "warning", {
                content: <p className='content'>
                    It is necessary for Orax to access the content of the messages in order to synchronize them between the channels. By inviting Orax, it will be able to read all the messages of your server.<br></br>
                    For security and privacy reasons, we suggest you to give him the permission to read the messages only in the channels the bot is concerned with.
                </p>,
                icon: meteor,
                action: function() {window.open('https://discord.com/oauth2/authorize?client_id=812298057470967858&scope=bot&permissions=536871936&guild_id=' + guild.id)}
            })} className={styles.button}>
                Add bot
                <strong>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </strong>
            </button>
            {
                /*guildStatus ? 
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
