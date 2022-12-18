import { useRouter } from 'next/router'
import dashboardStyles from '../../../styles/Dashboard.module.css'
import styles from '../../../styles/dashboard/OwnedGroup.module.css'
import { useEffect, useState } from 'react'
import config from '../../../utils/config'
import { getCookie } from '../../../utils/cookies'
import popup from '../../../utils/popup'
import drop from '../../../public/icons/drop.svg'
import fire from '../../../public/icons/fire.svg'
import Link from 'next/link'

export default function OwnedGroup() {
    const serverIp = config.serverIp
    const apiV2 = config.apiV2
    const router = useRouter()
    const { groupId } = router.query
    const [link, setLink] = useState('')
    const [channels, setChannels] = useState([])
    useEffect(() => {
        if (groupId) {
            fetch(`${serverIp}get_admin_group_datas`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId": ${groupId}, "guildId":"${guildId}" }` }).then(res => res.json()).then(datas => {
                if (datas.result) {
                    setLink("https://oraxbot.com/join/" + datas.link)
                    setChannels(datas.channels)
                }
            })
        }
    }, [groupId])
    const params = new URLSearchParams(router.asPath.split('?')[1])
    const guildId = params.get('guild')
    const guildIcon = params.get('icon')
    const groupName = params.get('groupName')
    return <>
        <div style={{backgroundImage: guildIcon && guildIcon != 'null' ? `url('https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.webp?size=96')` : null}} className={dashboardStyles.background} />
        <div className={styles.page}>
            <div className='line'>
                <Link href={'../?guild=' + guildId}>
                    <svg className={styles.back} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </Link>
                <h1 className={styles.title}>{groupName}</h1>
            </div>
            <div className="line">
                <p>Invite link</p> <a className={styles.inviteLink} href={link ? link : '#'} target="_blank" rel="noreferrer">{link ? link : "No invitation link found"}</a>
                <svg onClick={() => {navigator.clipboard.writeText(link);popup("Success", `Copied in the clipboard`, "default", {icon: drop})}} className={styles.linkIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
            </div>
            <button onClick={() => fetch(`${serverIp}generate_interserv_group_link`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId": ${groupId}, "guildId":"${guildId}" }`}).then(res => res.json()).then(datas => {
                if (datas.result) {
                    setLink( "https://oraxbot.com/join/" + datas.link)
                }
            })} className={styles.regenerateInviteLink}>Regenerate invite link</button>
            <br></br>
            {channels.length ?
            <section>
                <h2>Linked channels</h2>
                <div>
                    {channels.map((channel, index) => <div key={"channel_" + index} className={styles.channelContainer}>
                        <p>{channel.guildName}</p>
                        <svg className={styles.channelIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                        </svg>
                        <p>{channel.name}</p>
                        <svg onClick={() => {
                            fetch(`${serverIp}unlink_channel`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId":${groupId}, "channelId": "${channel.id}", "guildId":"${guildId}" }`}).then(res => res.json()).then(datas => {
                                if (datas.result) {
                                    setChannels(channels.filter(c => c.id != channel.id))
                                }
                            })
                        }} className={styles.removeChannelIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>)}
                </div>
            </section>
            :
            <section className={dashboardStyles.emptyGroupContainer}><h2>No channels linked to this group. Use or share the invite link to start adding more channels</h2></section>}
            <br></br>
            <div className='line'>
                <button onClick={() => 
                    popup("Rename the group", <div></div>, "error", { icon: drop, close: true, buttons: [
                        {
                            name: "Cancel",
                            className: "border normal"
                        },
                        {
                            name: "Rename",
                            action: function() {
                                fetch(`${apiV2}rename_interserv_group`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId": ${groupId}, "guildId":"${guildId}", "newName": "${document.getElementById('renameGroupInput').value}" }`}).then(res => res.json()).then(datas => {
                                    if (datas.result) {
                                        router.push('../?guild=' + guildId)
                                    }
                                })
                            }
                        }
                    ], action: function() {
                        fetch(`${serverIp}delete_interserv_group`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId": ${groupId}, "guildId":"${guildId}" }`}).then(res => res.json()).then(datas => {
                            if (datas.result) {
                                router.push('../?guild=' + guildId)
                            }
                        })
                    },
                    content: <input id='renameGroupInput' className='textInput normal' placeholder='New group name'></input>})
                } className='button round normal'>Rename</button>
                <button onClick={() => 
                    popup("Delete the group", "This action is irreversible. All channels linked to your group will be unlinked.", "error", { icon: fire, close: true, customButtonName: "Delete", action: function() {
                        fetch(`${serverIp}delete_interserv_group`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "groupId": ${groupId}, "guildId":"${guildId}" }`}).then(res => res.json()).then(datas => {
                            if (datas.result) {
                                router.push('../?guild=' + guildId)
                            }
                        })
                    }})
                } className='button round dangerous'>Delete the group</button>
            </div>
        </div>
    </>
}