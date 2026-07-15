import { Html, Head, Main, NextScript } from "next/document";

export default function App() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#5865F2" />
        <meta name="application-name" content="Orax" />
        <meta name="apple-mobile-web-app-title" content="Orax" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://oraxbot.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <div id="menu"></div>
        <div id="popup"></div>
      </body>
    </Html>
  );
}
