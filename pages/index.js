import styles from '../styles/Home.module.css'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Header />
      <section className={styles.gradient}>
        <div>
          <h1 className={styles.title}>
            get rid of <strong>bot attack</strong>
          </h1>
          <p className={styles.description}>
              in <strong className={[styles.strong, styles.v2].join(" ")}>only one slash command</strong>
          </p>
          <a href='#description'>
            <svg className={styles.bottomArrow} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>
      <section id="description">
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <div className={styles.exampleContainer}>
        <img src="/assets/strip1.svg" className={[styles.strip, styles.v1].join(" ")} />
          <div className={styles.glassCard}>
            <Image src="/illustrations/example1.png" alt="Example" layout='fill'  />
          </div>
          <p>
            <strong className={styles.strong}>Say goodbye to robots</strong>
            <br></br>
            <br></br>
            Captcha bot automatically generates an image
            containing text,
            which is very difficult for a robot to understand.
            It therefore prevents waves of automated
            users destroying your server.
          </p>
        </div>
        <div className={[styles.exampleContainer, styles.reverse].join(" ")}>
          <div className={styles.glassCard}>
            <Image src="/illustrations/example2.png" alt="Slash command example" layout='fill'  />
          </div>
          <p>
            <strong className={styles.strong}>One command, 100% customizable</strong>
            <br></br>
            <br></br>
            In a single command, change the avatar and name of the bot, as well as the title and description of the embed.
          </p>
        </div>
        <div className={styles.exampleContainer}>
          <div className={[styles.glassCard, styles.v2].join(" ")}>
            <Image src="/illustrations/server.svg" alt="Server illustration" layout='fill'  />
            <img src="/assets/shape1.svg" className={[styles.shape, styles.v1].join(" ")} />
          </div>
          <p>
            <strong className={styles.strong}>Secure and redundant</strong>
            <br></br>
            <br></br>
            To reduce the risk of damage in case of hacking, the bot only asks you for the permissions it needs. Moreover, the bot is hosted on several servers simultaneously, so even if one of them has a problem, the rest of the infrastructure continues to work, thus protecting your server 24/7.
          </p>
        </div>
      </section>
      {
      /*
      <a className={styles.inviteBot} href="https://discord.com/api/oauth2/authorize?client_id=991022601574973501&permissions=268823632&scope=applications.commands%20bot" target="_blank">
        Invite the bot
      </a>
      */
      }
      <Link href="dashboard">
        <p className="button round center">Dashboard</p>
      </Link>
      <section id="informations" className={styles.main}>
        <div className={styles.grid}>
        <Link href="/dashboard">
            <div className={styles.card}>
              <h2>Dashboard &rarr;</h2>
              <p>
                Setup the bot
              </p>
            </div>
          </Link>
          <Link href="/docs">
            <div className={styles.card}>
              <h2>Documentation &rarr;</h2>
              <p>How to use the bot, more informations about how it works</p>
            </div>
          </Link>
          <a href="https://discord.gg/Edb5UUsnTy" rel="noreferrer" className={styles.card}>
            <h2>Support server &rarr;</h2>
            <p>Any questions? A problem? A suggestion? Contact us ❤️</p>
          </a>
          <Link href="/tos">
            <div className={styles.card}>
              <h2>Privacy and TOS &rarr;</h2>
              <p>How we use and store your data, and those of your community</p>
            </div>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
