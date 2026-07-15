import Head from "next/head";
import styles from "../styles/Home.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import config from "../utils/config.json";

const SITE_URL = "https://oraxbot.com";
const SITE_NAME = "Orax";
const TITLE = "Orax — Sync Discord Channels Across Multiple Servers";
const DESCRIPTION =
  "Orax lets you sync channels between multiple Discord servers so communities can chat, share events, and collaborate without leaving their own server.";

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content="Discord bot, channel sync, cross-server chat, Discord integration, Orax, Interserv, server bridge" />
        <meta name="author" content="Orax" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/logo.png`} />
        <meta property="og:image:alt" content="Orax logo" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: DESCRIPTION,
              applicationCategory: "CommunicationApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>
      <Header />
      <section className={styles.gradient} aria-label="Hero">
        <div className={styles.heroContent}>
          <span className={styles.brand}>Orax</span>
          <h1 className={styles.title}>
            Sync your channels across multiple Discord servers
          </h1>
          <p className={styles.description}>
            Connect your communities together so they can chat, share events,
            and collaborate — without leaving their own server
          </p>
          <a
            href={config.inviteLink}
            target="_blank"
            rel="noreferrer"
            className={`button round main ${styles.cta}`}
          >
            Add to Discord
          </a>
          <a href="#description" aria-label="Scroll to features">
            <svg
              className={styles.bottomArrow}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </section>
      <section id="description" aria-label="Features">
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={styles.exampleContainer}>
          <img
            src="/assets/strip1.svg"
            className={[styles.strip, styles.v1].join(" ")}
            alt="Decorative wave divider"
          />
          <div className={styles.glassCard}>
            <Image
              src="/illustrations/example1.png"
              alt="Orax synced channels shown side by side across two Discord servers"
              layout="fill"
            />
          </div>
          <p>
            <strong className={styles.strong}>
              Connect multiple channels together
            </strong>
            <br />
            <br />
            Orax allows you to sync channels between multiple different servers,
            allowing great discussions of people from other servers, events,
            etc... without forcing everyone to join a specific server to discuss
            with each other.
          </p>
        </div>
        <div className={[styles.exampleContainer, styles.reverse].join(" ")}>
          <div className={[styles.glassCard, styles.secondCard].join(" ")}>
            <Image
              src="/illustrations/example2.png"
              alt="Slash command example"
              layout="fill"
            />
          </div>
          <p>
            <strong className={styles.strong}>Like a real chat</strong>
            <br />
            <br />
            Everything works as in a normal channel, you can send, modify,
            delete messages, and all this will be replicated on other Discord
            servers.
          </p>
        </div>
      </section>
      <Link href="dashboard">
        <p className="button round center main">Dashboard</p>
      </Link>
      <section id="informations" className={styles.main} aria-label="Resources and links">
        <div className={styles.grid}>
          <a
            href="https://docs.oraxbot.com"
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <h2>📚 Docs &rarr;</h2>
            <p>Learn how to use the bot with our documentation</p>
          </a>
          <a
            href="https://ko-fi.com/nicolasmarchand"
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <h2>❤️ Tip &rarr;</h2>
            <p>Support my hard work with my recently launched Ko-fi ✨</p>
          </a>
          <a
            href="https://discord.gg/e3pBtbum4A"
            target="_blank"
            rel="noreferrer"
            className={`${styles.card} ${styles.soft}`}
          >
            <h2>Support server &rarr;</h2>
            <p>Any questions? A problem? A suggestion? Contact us</p>
          </a>
          <Link href="/explore" className={`${styles.card} ${styles.soft}`}>
            <h2>Explore &rarr;</h2>
            <p>Discover public groups</p>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
