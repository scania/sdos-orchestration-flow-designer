import { useTheme } from "@/context/ThemeProvider";
import useWebComponent from "@/hooks/useWebComponent";
import { getSession } from "next-auth/react";
import styles from "./Settings.module.scss";
import { TdsToggle } from "@scania/tegel-react";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useWebComponent("tdsToggle", toggleTheme);

  return (
    <div>
      <div className={styles.main}>
        <h1>Settings</h1>
        <div className={styles.description}>Set your preferences here</div>
        <div className={styles.content}>
          <div className="mode-switcher">
            <TdsToggle ref={toggleRef as any} checked={theme == "dark"}>
              <div slot="label">{theme} mode</div>
            </TdsToggle>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
