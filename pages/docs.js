import styles from '../styles/Docs.module.css'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Image from 'next/image'

export default function Home() {
    return (
        <>
        <Header />
            <div className={styles.page}>
                <h1 className={styles.title}>Setup the Captcha</h1>
                <section className={styles.section}>
                    <h2 className={styles.subtitle}>Slash command</h2>
                    <a className={styles.link} href="https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=WHAT%20ARE%20SLASH%20COMMANDS%3F,to%20use%20your%20favorite%20bot." target="_blank" rel="noreferrer">
                        What are slash commands?
                    </a>
                    <div className={styles.imageContainer}>
                        <Image src="/docs/slash_command.png" layout="fill" />
                    </div>
                    <ul>
                        <li>To open this menu, after inviting the bot, you just have to write &quot;/&quot; in the chat bar.</li>
                        <li>Then select the Captcha command.</li>
                        <li>
                            Finally, you just have to fill in the following fields:
                            <ul>
                                <li><strong className={styles.strong}>Channel</strong> - The channel that will contain the captcha</li>
                                <li><strong className={styles.strong}>Role</strong> - The role given to people who complete the captcha</li>
                            </ul>
                            The other fields are not required
                        </li>
                    </ul>
                </section>
            </div>
        <Footer />
        </>
    )
}
