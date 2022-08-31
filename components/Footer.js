import Image from 'next/image'
import styles from '../styles/components/Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            Captcha bot
            <span>
                <Image src="/logo.png" alt="Captcha logo" width={16} height={16} />
            </span>
        </footer>
    )
}