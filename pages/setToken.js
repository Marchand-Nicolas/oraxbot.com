import { setCookie } from "../utils/cookies";

export default function setToken() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    setCookie("token", token, 10000000000);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  }
  return <></>;
}
