import "../styles/globals.css";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import NotificationSystem from "../components/ui/NotificationSystem";
import { useEffect } from "react";
import initializeGlobalErrorHandling from "../utils/globalErrorHandler";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      updateScroll();
      document.addEventListener("scroll", updateScroll);
      function updateScroll() {
        var h = document.documentElement,
          b = document.body,
          st = "scrollTop",
          sh = "scrollHeight";
        var percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight);
        root.style.setProperty("--scroll_percent", percent);
      }

      // Initialize global error handling
      initializeGlobalErrorHandling();
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <NotificationSystem />
    </ErrorBoundary>
  );
}

export default MyApp;
