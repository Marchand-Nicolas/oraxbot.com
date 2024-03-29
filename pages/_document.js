import { Html, Head, Main, NextScript } from "next/document";

export default function App() {
  return (
    <Html>
      <Head />
      <title>Orax bot</title>
      <meta
        name="description"
        content="Orax allows you to sync channels between multiple different Discord servers, allowing great discussions of people from other servers, events, etc... on Discord."
      />
      <link rel="icon" href="/favicon.ico" />
      <body>
        <Main />
        <NextScript />
        <div id="menu"></div>
        <div id="popup"></div>
      </body>
    </Html>
  );
}
