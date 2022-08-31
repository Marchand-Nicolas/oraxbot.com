import { Html, Head, Main, NextScript } from 'next/document'

export default function App () {
    return (
        <Html>
            <Head />
            <title>Captcha Discord bot</title>
            <meta name="description" content="Captcha is a Discord bot providing an anti-bot system using a Captcha." />
            <link rel="icon" href="/favicon.ico" />
            <body>
                <Main />
                <NextScript />
                <div id="popup"></div>
            </body>
        </Html>
    )
}