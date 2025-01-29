import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const noNavbarRoutes = ["/register", "/login"]; 
  return (
    <div>
      {!noNavbarRoutes.includes(router.pathname) && <Navbar />}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
