import styles from "../styles/Home.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <section className={styles.gradient}>
        <div>
          <h1 className={styles.title}>Interserv</h1>
          <p className={styles.description}>
            Connect your favorite servers{" "}
            <strong className={[styles.strong, styles.v2].join(" ")}>
              together
            </strong>
          </p>
          <a href="#description">
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
      <section id="description">
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={styles.exampleContainer}>
          <img
            src="/assets/strip1.svg"
            className={[styles.strip, styles.v1].join(" ")}
          />
          <div className={styles.glassCard}>
            <Image
              src="/illustrations/example1.png"
              alt="Example"
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
          <div className={styles.glassCard}>
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
        <p className="button round center">Dashboard</p>
      </Link>
      <section id="informations" className={styles.main}>
        <div className={styles.grid}>
          <Link href="/dashboard">
            <div className={styles.card}>
              <h2>Dashboard &rarr;</h2>
              <p>Setup the bot</p>
            </div>
          </Link>
          <a
            href="https://www.patreon.com/user?u=111388918"
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <h2>❤️ Patreon &rarr;</h2>
            <p>Support our hard work with our recently launched Patreon ✨</p>
          </a>
          <a
            href="https://discord.gg/PJumX8FjRV"
            target="_blank"
            rel="noreferrer"
            className={`${styles.card} ${styles.soft}`}
          >
            <h2>Support server &rarr;</h2>
            <p>Any questions? A problem? A suggestion? Contact us</p>
          </a>
          <Link href="/tos">
            <div className={`${styles.card} ${styles.soft}`}>
              <h2>TOS &rarr;</h2>
              <p>Terms of service</p>
            </div>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
