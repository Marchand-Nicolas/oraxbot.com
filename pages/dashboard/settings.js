import dashboardStyles from '../../styles/Dashboard.module.css'
import styles from '../../styles/components/dashboard/Settings.module.css'
import { useEffect, useState } from 'react'
import config from '../../utils/config.json'
import { getCookie } from '../../utils/cookies'

export default function Settings(props) {
    const [settings, setSettings] = useState({ lang: 0 })

    useEffect(() => {
        setSettings(props.settings)
    }, [props.settings])

    const updateSettings = async (e, field) => {
        const newSettings = settings
        newSettings[field] = e.target.selectedIndex
        setSettings(newSettings)
        fetch(`${config.serverIp}set_server_settings`, { method: 'POST', body : `{ "token": "${getCookie('token')}", "guildId":"${props.guildId}", "settings": ${JSON.stringify(settings)} }` }).then(res => res.json()).then(datas => {
            if (datas.result) {
            }
        })
    }

    return <>
            <h2>Settings</h2>
            <div className={[styles.parameter, 'line'].join(' ')}>
                <p className={styles.parameterName}>Language</p>
                <select key={"guild_" + props.guildId + "_" + settings.lang} id="selectLang" onChange={(e) => updateSettings(e, 'lang')} defaultValue={settings.lang} className={['input', styles.parameterInput].join(' ')}>
                    {
                        config.serverLanguages.map((language, index) =>
                            <option key={"lang_" + index} value={index}>{language}</option>
                        )
                    }
                </select>
            </div>
        </>
}