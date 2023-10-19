import { useTheme } from "@/context/ThemeProvider";
import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "./landing.module.scss";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Tabs from "@/components/Tabs/Tabs";
import Panel from "@/components/Tabs/Panel";
import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

// server side auth check
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

function App() {
  const { theme } = useTheme();
  const [cardCount, setCardCount] = useState<number>(4);
  const { data: session } = useSession();
  const [errorState, setErrorState] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [descInput, setDescInput] = useState<string>("");

  const renderCards = () =>
    new Array(cardCount)
      .fill(null)
      .map((item, index) => <Card key={index}></Card>);

  const handleName = (event: FormEvent<HTMLTdsTextFieldElement>) => {
    setNameInput(event.currentTarget.value);
  };

  const handleDesc = (event: FormEvent<HTMLTdsTextareaElement>) => {
    setDescInput(event.currentTarget.value);
  };

  const createNewGraph = () => {
    if (nameInput == "" || descInput == "") {
      setErrorState(true);
    } else {
      /* Navigate to workspace page */

      setErrorState(false);
      setCardCount(cardCount + 1);
    }
  };

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
                {session?.user?.name?.toLocaleUpperCase()}
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
                id="create-new-graph-button"
                type="button"
                variant="primary"
              >
                <div className="tds-u-mr1">Create new graph</div>
                <tds-icon name="plus" size="16px"></tds-icon>
              </Button>
              <tds-modal selector="#create-new-graph-button" size="xs">
                <h5 className="tds-modal-headline" slot="header">
                  Create new graph
                </h5>
                <span slot="body">
                  <tds-text-field
                    id="modal-name-field"
                    placeholder="Name"
                    size="sm"
                    mode-variant={theme == "light" ? "primary" : "secondary"}
                    helper={
                      errorState && nameInput == ""
                        ? "To continue, please give the graph a name."
                        : ""
                    }
                    state={errorState && nameInput == "" ? "error" : "default"}
                    onInput={handleName}
                  />
                  <div style={{ marginTop: "28px" }} />
                  <tds-textarea
                    id="modal-description-area"
                    placeholder="Description"
                    rows={4}
                    mode-variant={theme == "light" ? "primary" : "secondary"}
                    helper={
                      errorState && descInput == ""
                        ? "To continue, please add a description."
                        : "Write a description for the use case of the graph"
                    }
                    state={errorState && descInput == "" ? "error" : "default"}
                    onInput={handleDesc}
                  />
                </span>
                <span slot="actions">
                  <tds-button
                    size="md"
                    text="Create"
                    type="submit"
                    modeVariant="primary"
                    onClick={createNewGraph}
                  />
                </span>
              </tds-modal>
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
