import "../styles/globals.css";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const NotificationSystem = dynamic(
  () => import("../components/ui/NotificationSystem"),
  { ssr: false },
);
import initializeGlobalErrorHandling from "../utils/globalErrorHandler";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
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
