import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    updateScroll()
    document.addEventListener('scroll', updateScroll)
    function updateScroll() {
      var h = document.documentElement, 
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';
      var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight)
      root.style.setProperty('--scroll_percent', percent);
    }
  }
  return <Component {...pageProps} />
}

export default MyApp
