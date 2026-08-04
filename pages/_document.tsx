import { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";

interface AppDocumentProps extends DocumentInitialProps {
  lang: string;
}

export default function App({ lang }: AppDocumentProps) {
  return (
    <Html lang={lang}>
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

App.getInitialProps = async (ctx: DocumentContext): Promise<AppDocumentProps> => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  const path = ctx.asPath || ctx.pathname || "/";
  let lang = "en";
  if (path.startsWith("/fr")) lang = "fr";
  else if (path.startsWith("/es")) lang = "es";
  return { ...initialProps, lang };
};
