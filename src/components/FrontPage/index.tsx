import Link from "@/components/Link";
import { signIn } from "next-auth/react";
import React from "react";
import styles from "./FrontPage.module.scss";
type Mode = "login" | "logout";
interface FrontPageProps {
  mode: Mode;
}

const FrontPage: React.FC<FrontPageProps> = ({ mode }) => {
  return (
    <div className={styles.login}>
      <div className={styles.login__leftPane}>
        <div className={styles.login__title}>
          {mode === "logout" ? (
            <h3
              className={`tds-headline-03 tds-text-grey-600 ${styles.login__title}`}
            >
              You have been signed out
            </h3>
          ) : (
            <>
              <h3 className={`tds-headline-03 ${styles.login__title}`}>
                Sign in to
              </h3>
              <h3
                className={`tds-headline-03 tds-text-grey-600 ${styles.login__title}`}
              >
                Orchestration Flow Designer Beta 1.0
              </h3>
            </>
          )}
        </div>
        <tds-divider orientation="horizontal"></tds-divider>

        <div className={styles.login__signInButton}>
          <tds-button
            type="button"
            variant="primary"
            size="lg"
            text="Sign in"
            fullbleed
            onClick={() =>
              signIn("azure-ad", { callbackUrl: `${window.location.origin}/` })
            }
          ></tds-button>
        </div>
        <div>
          <Link href="#" underline>
            Request Access Via Scania now
          </Link>
        </div>
        <div className={styles.login__leftPane__bottom}>
          <div className={styles.login__spacer}></div>
          <div>
            <a href="#" className={styles.login__leftPane__link}>
              Knowledge graph as a service
            </a>
            <tds-icon
              name="redirect"
              size="16px"
              style={{ marginLeft: "8px" }}
            ></tds-icon>
          </div>
        </div>
      </div>

      <div className={styles.login__rightPane}>
        <div className={styles.login__rightPane__text}>
          <h1
            className="tds-headline-01 tds-text-grey-50"
            style={{ fontSize: 50 }}
          >
            WELCOME TO OUR ORCHESTRATION SERVICE
          </h1>
          <h3 className="tds-headline-03 tds-text-grey-50">
            A part of knowledge graphs as a service.
          </h3>
          <p
            className="tds-body-01 tds-text-grey-50"
            style={{ fontWeight: 400 }}
          >
            Through this application, you are able to use our orchestration
            service and create an orchestration flow graph.
          </p>
          <p
            className="tds-body-01 tds-text-grey-50"
            style={{ fontWeight: 400 }}
          >
            The result lets us complete the knowledge graph by collecting all
            relevant data within Scania.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FrontPage;
