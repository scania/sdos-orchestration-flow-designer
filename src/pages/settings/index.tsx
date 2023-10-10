import { useTheme } from "@/context/ThemeProvider";
import useWebComponent from "@/hooks/useWebComponent";
import { getSession } from "next-auth/react";
import styles from "./Settings.module.scss";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/api/auth/signin",
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
    <div className={`App`}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles["header__project"]}>
            <div className={styles["header__project-heading"]}>
              <h1>Settings</h1>
            </div>

            <div className={styles["header__project-summary"]}>
              Set your preferences here
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className="mode-switcher">
            <tds-toggle ref={toggleRef as any} checked={theme == "dark"}>
              <div slot="label">{theme} mode</div>
            </tds-toggle>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
