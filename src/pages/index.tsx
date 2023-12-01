import Button from "@/components/Button";
import Card from "@/components/Card";
import Panel from "@/components/Tabs/Panel";
import Tabs from "@/components/Tabs/Tabs";
import { useTheme } from "@/context/ThemeProvider";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "./landing.module.scss";

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
  const [cardCount, setCardCount] = useState<number>(7);
  const { data: session } = useSession();
  const [errorState, setErrorState] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [descInput, setDescInput] = useState<string>("");
  const router = useRouter();

  const renderCards = () =>
    new Array(cardCount)
      .fill(null)
      .map((item, index) => <Card key={index}></Card>);

  const handleName = (event: FormEvent<HTMLTdsTextFieldElement>) => {
    setNameInput(event.currentTarget.value);
  };

  // const handleDesc = (event: FormEvent<HTMLTdsTextareaElement>) => {
  //   setDescInput(event.currentTarget.value);
  // };

  const createNewGraph = () => {
    if (nameInput == "") {
      setErrorState(true);
    } else {
      /* Navigate to workspace page */

      setErrorState(false);
      router.push(`/ofd/${nameInput.replace(/\s+/g, "-")}`);
    }
  };

  return (
    <div className={`App`}>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <Tabs>
            <Panel title="My Work"></Panel>
            <Panel title="All Designs"></Panel>
          </Tabs>
        </div>
        <div className={styles.content}>
          <div className={styles["header__project-summary"]}>
            <h2 className={styles["content__heading"]}>My Work</h2>
            Open and edit your orchestration flow graph or create a new one.
            <br />
            You can also view what graph are available to you from other
            <br /> projects
          </div>
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
                  {/* <tds-textarea
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
                  /> */}
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

            <h2 className={styles["content__headingcontent"]}>In Focus</h2>

            <div className={styles["content__main__cards"]}>
              {renderCards()}
            </div>

            <div className={styles["content__main__line"]}>
              <tds-divider orientation="horizontal"></tds-divider>
            </div>

            <h2 className={styles["content__headingcontent"]}>Other</h2>

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
