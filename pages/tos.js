import styles from '../styles/Tos.module.css'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Image from 'next/image'

export default function Home() {
    return (
        <>
        <Header />
            <div className={styles.page}>
                <h1>TOS and Privacy of the Discord bot (and its website)</h1>
                <section className={styles.section}>
                    <h2>1. Terms</h2>
                    <p>By accessing this website, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.</p>
                </section>
                <section className={styles.section}>
                    <h2>2. Use License</h2>
                    <p>Permission is granted to temporarily download one copy of the materials on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                    <ul>
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose or for any public display;</li>
                        <li>attempt to reverse engineer any software contained on our ebsite;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transferring the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
                    </ul>
                    
                    <p>This will let us to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format. These Terms of Service has been created with the help of the <a href="https://www.termsofservicegenerator.net">Terms Of Service Generator</a>.</p>
                </section>
                <section className={styles.section}>
                    <h2>3. Disclaimer</h2>
                    <p>All the materials on this website are provided &quot;is&quot;. We makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, We do not make any representations concerning the accuracy or reliability of the use of the materials on our Website or otherwise relating to such materials or any sites linked to this Website.</p>
                </section>
                <section className={styles.section}>
                    <h2>4. Limitations</h2>
                    <p>We will not be hold accountable for any damages that will arise with the use or inability to use the materials on our website, even if we or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</p>
                </section>
                <section className={styles.section}>
                    <h2>5. Revisions and Errata</h2>
                    <p>The materials appearing on our website may include technical, typographical, or photographic errors. We will not promise that any of the materials in this website are accurate, complete, or current. We may change the materials contained on the website at any time without notice. We do not make any commitment to update the materials.</p>
                </section>
                <section className={styles.section}>
                    <h2>6. Links</h2>
                    <p>We have not reviewed all of the sites linked to the Website and we are not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by our team of the site. The use of any linked website is at the user&apos;s own risk.</p>
                </section>
                <section className={styles.section}>
                    <h2>7. Site Terms of Use Modifications</h2>
                    <p>We may revise our Terms of Use for the website and the discord bot at any time without prior notice. By using this website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</p>
                </section>
                <section className={styles.section}>
                    <h2>8. Governing Law</h2>
                    <p>Any claim relating to our website shall be governed by the laws of the United States of America without regard to its conflict of law provisions.</p>
                </section>
                <section className={styles.section}>
                    <h2>9. Privacy</h2>
                    <p>We will not use your personal information for any purpose other than to provide the service, unless we have your permission or are otherwise required to do so by law.</p>
                    <p>We do not store any data related to your discord server, its members, its administrators, its messages, its roles. Absolutely nothing except :</p>
                    <ul>
                        <li>Your discord user id if you make a purchase on our website. It will be used in these circumstances :</li>
                        <ul>
                            <li>Problem with a purchase, migration of the purchase</li>
                        </ul>
                        <li>the email address linked to your discord account, at the time of each purchase. It will be used in these circumstances :</li>
                        <ul>
                            <li>Problem with a purchase, migration of the purchase</li>
                        </ul>
                        <li>The discord server id linked to your purchase. It will be used in these circumstances :</li>
                        <ul>
                            <li>Check if your discord server has a paid license for the bot.</li>
                        </ul>
                        <li>In case of purchase with Paypal, the order ID. It will be used in these circumstances :</li>
                        <ul>
                            <li>Purchase a license for the bot, problem with a purchase, migration of the purchase</li>
                        </ul>
                    </ul>
                    <p>We do not store any other data about you, your actions, or anything related to you, except some statistical data about your browsing (page load times, amount of visits on the website), for the sole purpose of learning about the performance of our site, including its optimization, especially in an attempt to reduce load times.</p>
                    <p>If you wish to delete some or all of this data, please contact us to this email address : nicomarchand29@gmail.com</p>
                </section>
            </div>
        <Footer />
        </>
    )
}
