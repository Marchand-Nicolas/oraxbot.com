import LoginHub from "../../components/LoginHub";

/**
 * Login hub for the dashboard. Delegates to the shared `LoginHub`
 * component with auto-redirect enabled so visitors that already have a
 * platform session bounce straight to their dashboard.
 */
export default function DashboardLogin() {
  return <LoginHub autoRedirect />;
}
