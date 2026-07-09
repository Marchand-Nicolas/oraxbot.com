import "../styles/globals.css";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { useEffect } from "react";
import type { AppType } from "next/app";
import { Analytics } from "@vercel/analytics/next";
import { ScrollProvider } from "../utils/ScrollContext";
import NotificationSystem from "../components/ui/NotificationSystem";
import initializeGlobalErrorHandling from "../utils/globalErrorHandler";

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize global error handling
      initializeGlobalErrorHandling();
    }
  }, []);

  return (
    <ErrorBoundary>
      <ScrollProvider>
        <Component {...pageProps} />
        <NotificationSystem />
        <Analytics />
      </ScrollProvider>
    </ErrorBoundary>
  );
};

export default MyApp;
