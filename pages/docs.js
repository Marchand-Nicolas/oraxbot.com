import styles from "../styles/Docs.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <div className={styles.page}>
        <h1 className={styles.title}>Setup the interserv group</h1>
        <section className={styles.section}>
          <h2 className={styles.subtitle}>1. Create the group</h2>
          To start, open the{" "}
          <a
            className="link"
            href="https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=WHAT%20ARE%20SLASH%20COMMANDS%3F,to%20use%20your%20favorite%20bot."
            target="_blank"
            rel="noreferrer"
          >
            dashboard
          </a>
        </section>
      </div>
      <Footer />
    </>
  );
}
