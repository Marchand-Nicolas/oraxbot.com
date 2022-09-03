import Image from "next/image"
import { useState } from "react"
import styles from '../../styles/components/dashboard/CreateGroupMenu.module.css'
import { getCookie } from "../../utils/cookies"
import config from "../../utils/config"
import popup from "../../utils/popup"
import { unmountComponentAtNode } from "react-dom"
import meteor from "../../public/icons/meteor.svg"
import drop from "../../public/icons/drop.svg"

export default function createGroupMenu(props) {
    const serverIp = config.serverIp
    const [channels, setChannels] = useState([])

    useState(() => {
        if(props.guildId) {
            fetch(`${serverIp}get_guild_channels`, { method: 'POST', body : `{ "guildId": "${props.guildId}" }` }).then(res => res.json()).then(res => {
                setChannels(res.result)
            })
        }
    }, [props])
    return <div className={"popup"}>
    <div className="container">
        <div>
            <Image src="/icons/drop.svg" height={50} width={50} />
            <h2 style={{marginLeft: "15px"}}>Create a new group</h2>
        </div>
        <br></br>
        <input id="groupName" className="textInput" placeholder="Group name"></input>
        <p className="description">First linked channel</p>
        <select id="selectChannel" className={['textInput', styles.textInput].join(" ")}>
            {channels.map((channel, index) => <option key={"option_" + index} value={channel.id}>{channel.name}</option>)}
        </select>
        <br></br>
        <br></br>
        <button onClick={() => {
            const groupName = document.getElementById("groupName").value
            const selectedChannelId = document.getElementById("selectChannel").value
            if (!groupName) {
                popup("Error", "Please enter a group name", "error", { icon: meteor })
                return
            }
            if (!selectedChannelId) {
                popup("Error", "Please select a channel", "error", { icon: meteor })
                return
            }
            fetch(`${serverIp}create_group`, { method: 'POST', body : `{ "guildId": "${props.guildId}", "channelId": "${selectedChannelId}", "groupName": "${groupName}" }` }).then(res => res.json()).then(res => {
                console.log(res)
                if (res.error) {
                    switch (res.error) {
                        case 2:
                            popup("Error", "A single server cannot have more than 10 groups", "error", { icon: meteor })
                        break;
                        default:
                            popup("Error", "Unknown error; Error code : " + res.error, "error", { icon: meteor })
                        break;
                    }
                }
                else {
                    popup("Success", "Group created", "success", { icon: drop })
                    unmountComponentAtNode(document.getElementById("menu"))
                    props.setRefreshGuildDatas(true)
                }
            })
        }}>Create</button>
        <br></br>
        <button className={styles.cancelButton} onClick={() => {
            unmountComponentAtNode(document.getElementById("menu"))
        }}>Cancel</button>
    </div>
</div>
}