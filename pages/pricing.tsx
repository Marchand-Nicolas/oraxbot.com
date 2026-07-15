import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Pricing.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import config from "../utils/config.json";

const SITE_URL = "https://oraxbot.com";
const TITLE = "Pricing — Orax";
const DESCRIPTION =
  "Orax is free to use. Unlock Orax Plus for higher limits by voting on Top.gg, subscribing monthly, or buying a lifetime plan.";

export default function Pricing() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/pricing`} />
        <link rel="canonical" href={`${SITE_URL}/pricing`} />
      </Head>
      <Header />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Pricing</h1>
          <p>
            Orax is free to use for everyone. Unlock Orax Plus to raise your
            server&apos;s limits — vote for free on Top.gg, subscribe monthly,
            or buy a lifetime plan.
          </p>
        </header>

        <div className={styles.tiers}>
          <div className={styles.tier}>
            <p className={styles.tierName}>Free</p>
            <div className={styles.price}>
              <span className={styles.priceAmount}>$0</span>
            </div>
            <p className={styles.tierDescription}>
              Everything you need to get started connecting your communities.
            </p>
            <ul className={styles.features}>
              <li>
                <span className={styles.check}>&#10003;</span>
                Up to 2 interserver groups per server
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Up to 5 synced channels per group
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Two-way message sync
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Community support
              </li>
            </ul>
            <a
              href={config.inviteLink}
              target="_blank"
              rel="noreferrer"
              className={styles.cta}
            >
              Add to Discord
            </a>
          </div>

          <div className={`${styles.tier} ${styles.featured}`}>
            <span className={styles.tierBadge}>Most popular</span>
            <p className={styles.tierName}>Orax Plus</p>
            <div className={styles.price}>
              <span className={styles.priceAmount}>from $2.99</span>
              <span className={styles.pricePeriod}>/ mo</span>
            </div>
            <p className={styles.tierDescription}>
              For power users and large communities that need more.
            </p>
            <ul className={styles.features}>
              <li>
                <span className={styles.check}>&#10003;</span>
                Up to 100 interserver groups per server
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Up to 50 synced channels per group
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Two-way message sync
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                Priority email support
              </li>
            </ul>
            <Link href="/dashboard" className={`${styles.cta} ${styles.main}`}>
              Get Orax Plus
            </Link>
          </div>
        </div>

        <section className={styles.waysSection}>
          <h2>Three ways to get Orax Plus</h2>
          <div className={styles.ways}>
            <div className={styles.way}>
              <h3>Vote on Top.gg</h3>
              <p className={styles.wayPrice}>Free</p>
              <p>
                Vote once a week for Orax on Top.gg. Activation is automatic
                and lasts until your vote expires.
              </p>
            </div>
            <div className={styles.way}>
              <h3>Monthly subscription</h3>
              <p className={styles.wayPrice}>$2.99 / month</p>
              <p>
                A recurring monthly subscription billed securely through
                Stripe. Cancel anytime.
              </p>
            </div>
            <div className={styles.way}>
              <h3>Lifetime</h3>
              <p className={styles.wayPrice}>$19.99 once</p>
              <p>
                Pay once and keep Orax Plus forever for this server. No
                recurring charges.
              </p>
            </div>
          </div>
          <p className={styles.waysNote}>
            Orax Plus is activated per Discord server. Open the dashboard,
            select your server, and choose how you&apos;d like to unlock it.
          </p>
        </section>

        <section className={styles.faq}>
          <h2>Frequently asked questions</h2>
          <div className={styles.faqItem}>
            <h3>Is Orax really free?</h3>
            <p>
              Yes. The free plan lets you create interserver groups and sync
              channels at no cost. Orax Plus is completely optional.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>How does the Top.gg vote work?</h3>
            <p>
              Vote for Orax on Top.gg once a week. Orax Plus activates
              automatically and stays active until the vote expires — just vote
              again to extend it.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>Can I cancel my monthly subscription?</h3>
            <p>
              Absolutely. You can cancel whenever you like and you will keep
              access until the end of your billing period.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>Is Orax Plus per server or per account?</h3>
            <p>
              Orax Plus is activated per Discord server. Each server you want to
              upgrade needs its own Orax Plus plan.
            </p>
          </div>
          <div className={styles.faqMore}>
            <a
              href="https://docs.oraxbot.com/faq"
              target="_blank"
              rel="noreferrer"
              className={`${styles.cta} ${styles.main}`}
            >
              More
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
