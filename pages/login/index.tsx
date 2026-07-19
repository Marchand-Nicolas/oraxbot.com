import LoginHub from "../../components/LoginHub";

/**
 * Login page. Behaves like `/dashboard` but never auto-redirects signed-in
 * users, so the platform chooser is always shown.
 */
export default function LoginPage() {
  return <LoginHub />;
}
