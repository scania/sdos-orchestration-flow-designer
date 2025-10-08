import { signIn } from "next-auth/react";
import React from "react";
import styles from "./FrontPage.module.scss";
import { TdsButton, TdsDivider } from "@scania/tegel-react";
type Mode = "login" | "logout";
interface FrontPageProps {
  mode: Mode;
}

const FrontPage: React.FC<FrontPageProps> = ({ mode }) => {
  return (
    <div className={styles.login}>
      <div className={styles.login__leftPane}>
        <div className={`${styles.login__title}`}>
          {mode === "logout" ? (
            <h3 className={`tds-text-grey-600 ${styles.login__title}`}>
              You have been signed out
            </h3>
          ) : (
            <>
              <h3 className={`${styles.login__title}`}>Sign in to</h3>
              <h3 className={`tds-text-grey-600 ${styles.login__title}`}>
                {`Orchestration Flow Graph Designer ${
                  process.env.NEXT_PUBLIC_VERSION || ""
                }`}
              </h3>
            </>
          )}
        </div>
        <TdsDivider orientation="horizontal"></TdsDivider>
        <div className={styles.login__signInButton}>
          <TdsButton
            type="button"
            variant="primary"
            size="lg"
            text="Sign in"
            fullbleed
            onClick={() =>
              signIn("azure-ad", { callbackUrl: `${window.location.origin}/` })
            }
          ></TdsButton>
        </div>
        <div className={styles.login__leftPane__bottom}>
          <div className={styles.login__spacer}></div>
        </div>
      </div>

      <div className={styles.login__rightPane}>
        <div className={`${styles.login__rightPane__text} tds-text-grey-50`}>
          <h1 style={{ fontSize: 50 }}>WELCOME TO OUR ORCHESTRATION SERVICE</h1>
          <h3>A part of knowledge graphs as a service.</h3>
          <p className="tds-body-01">
            Through this application, you are able to use our orchestration
            service and create an orchestration flow graph.
          </p>
          <p className="tds-body-01">
            The result lets us complete the knowledge graph by collecting all
            relevant data within Scania.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FrontPage;
