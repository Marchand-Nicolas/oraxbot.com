import styles from '../styles/Tos.module.css'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Privacy() {
    return (
        <>
        <Header />
        <div className={styles.page}>
            <h1>Privacy with the Discord bot (and its website)</h1>
            <section className={styles.section}>
                <h2>1. Stored data</h2>
                    <p>We will not use your personal information for any purpose other than to provide the service, unless we have your permission or are otherwise required to do so by law.</p>
                    <p>We do not store any data related to your discord server, its members, its administrators, its messages, its roles. Absolutely nothing except :</p>
                    <ul>
                        <li>Your discord server ID, if you create or join an interserver group. It will be used in these circumstances :</li>
                        <ul>
                            <li>Know which servers are linked to the interserver group</li>
                        </ul>
                        <li>Some your server's channel ID, if you create or join an interserver group. It will be used in these circumstances :</li>
                        <ul>
                            <li>Know which channels are linked to the interserver group</li>
                        </ul>
                        <li>ID of webhooks generated by the bot, if you create or join an interserver group. It will be used in these circumstances :</li>
                        <ul>
                            <li>Send messages in the linked channels using the webhooks</li>
                        </ul>
                    </ul>
                    <p>If you wish to delete some or all of this data, please contact us to this email address : nicomarchand29@gmail.com</p>
                </section>
                <section className={styles.section}>
                <h2>2. Data received and processed by the bot</h2>
                    <p>We receive all the data given by discord publicly, as well as the messages you send in all the channels whose bot has the "Read Messages" permission. However, most of this data is ignored.</p>
                    <p>We use your messages in these circumstances :</p>
                    <ul>
                        <li>If the channel is linked to an Interserver group (this can be done manually by the discord server administrators), the messages will be replicated to other Discord servers. However, it is possible to delete all messages replicated by the bot by simply deleting the messages you sent (if recently sent). Additionally, each time a user speaks for the first time in an interserv channel, he is warned that his messages will be sent to other Discord servers.</li>
                    </ul>
                </section>
            </div>
            <Footer />
        </>
    )
}
