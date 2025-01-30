import { useTheme } from "@/context/ThemeProvider";
import useWebComponent from "@/hooks/useWebComponent";
import { getSession } from "next-auth/react";
import styles from "./Settings.module.scss";

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
        <div className={styles.description}>
          Set your preferences here
        </div>
        <div className={styles.content}>
          <div className="mode-switcher">
            <tds-toggle ref={toggleRef as any} checked={theme == "dark"}>
              <div slot="label">{theme} mode</div>
            </tds-toggle>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
