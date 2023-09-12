import { useState } from "react";
import Link from "next/link";
import styles from "./landing.module.scss";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Tabs from "@/components/Tabs/Tabs";
import Panel from "@/components/Tabs/Panel";

function App() {
  const [cardCount, setCardCount] = useState<number>(4);

  const renderCards = () =>
    new Array(cardCount)
      .fill(null)
      .map((item, index) => <Card key={index}></Card>);

  return (
    <div className={`App`}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles["header__project"]}>
            <div className={styles["header__project-heading"]}>
              <h1>
                ORCHESTRATION FLOW
                <br /> DESIGNER{" "}
              </h1>
            </div>

            <div className={styles["header__project-summary"]}>
              Open and edit your orchestration flow graph or create a new one.
              <br />
              You can also view what graph are available to you from other
              <br /> projects
            </div>
          </div>

          <div className={styles["header__info"]}>
            <div className={styles["header_info"]}>
              <h6 className={styles["header__info__user-name"]}>
                THOMAS LARSSON
              </h6>
              <h6 className={styles["header__info__user-role"]}> ADMIN </h6>
            </div>

            <Link href="help">
              <div className={styles["header__info-help"]}>
                <tds-icon name="info" size="20"></tds-icon>
                Need Help?
              </div>
            </Link>
          </div>
        </div>
        <div className={styles.tabs}>
          <Tabs>
            <Panel title="Your Work"></Panel>
            <Panel title="All Designs"></Panel>
            <Panel title="Support"></Panel>
          </Tabs>
        </div>
        <div className={styles.content}>
          <h2 className={styles["content__heading"]}>In Focus</h2>
          <div className={styles["content__main"]}>
            <div className={styles["content__main__buttons"]}>
              <Button
                type="button"
                variant="primary"
                onClick={() => setCardCount(cardCount + 1)}
              >
                <div className="tds-u-mr1">Create new graph</div>
                <tds-icon name="plus" size="16px"></tds-icon>
              </Button>
              <Button type="button" variant="secondary">
                <div className="tds-u-mr1">Find graph to reuse</div>
                <tds-icon name="redirect" size="16px"></tds-icon>
              </Button>
            </div>
            <div className={styles["content__main__cards"]}>
              {renderCards()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
