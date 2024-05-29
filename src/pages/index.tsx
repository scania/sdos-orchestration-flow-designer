import { env } from "@/lib/env";
import { FormEvent, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeProvider";
import axios from "axios";
import Button from "@/components/Button";
import Card from "@/components/Card/Card";
import Panel from "@/components/Tabs/Panel";
import styles from "./landing.module.scss";
import Tabs from "@/components/Tabs/Tabs";

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
  const baseUrl = env.NEXTAUTH_URL;
  const response = await axios.get(`${baseUrl}/api/flows`, {
    headers: {
      cookie: context.req.headers.cookie, // Forward the session cookie
    },
  });
  const initialFlows = response.data;

  return {
    props: {
      baseUrl,
      initialFlows,
    },
  };
}

interface Flow {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

function App({
  initialFlows,
  baseUrl,
}: {
  initialFlows: Flow[];
  baseUrl: string;
}) {
  const { theme } = useTheme();
  const [errorState, setErrorState] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [descInput, setDescInput] = useState<string>("");
  const [flows, setFlows] = useState<Flow[]>(initialFlows);
  const router = useRouter();

  const handleName = (event: FormEvent<HTMLTdsTextFieldElement>) => {
    setNameInput(event.currentTarget.value);
  };

  const handleDesc = (event: FormEvent<HTMLTdsTextareaElement>) => {
    setDescInput(event.currentTarget.value);
  };

  const fetchFlows = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/flows`);
      setFlows(response.data);
    } catch (error) {
      console.error("Failed to fetch flows:", error);
    }
  };

  const createNewGraph = () => {
    localStorage.removeItem("graphDescription");
    if (nameInput === "") {
      setErrorState(true);
    } else {
      setErrorState(false);
      router.push(
        {
          pathname: `/ofd/new`,
          query: {
            graphName: nameInput.replace(/\s+/g, "-"),
            description: descInput,
          },
        },
        `/ofd/${nameInput.replace(/\s+/g, "-")}`
      );
    }
  };

  const deleteGraph = async (id: string) => {
    try {
      await axios.delete(`${baseUrl}/api/flow/${id}`);
      await fetchFlows(); // Fetch the updated flows after deletion
    } catch (error) {
      console.error("Failed to delete graph:", error);
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
                    mode-variant={theme === "light" ? "primary" : "secondary"}
                    helper={
                      errorState && nameInput === ""
                        ? "To continue, please give the graph a name."
                        : ""
                    }
                    state={errorState && nameInput === "" ? "error" : "default"}
                    onInput={handleName}
                  />
                  <div style={{ marginTop: "28px" }} />
                  <tds-textarea
                    id="modal-description-area"
                    placeholder="Description"
                    rows={4}
                    mode-variant={theme === "light" ? "primary" : "secondary"}
                    state={errorState && descInput === "" ? "error" : "default"}
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

            <h2 className={styles["content__headingcontent"]}>Graphs</h2>

            <div className={styles["content__main__cards"]}>
              {flows.map((flow) => (
                <Card key={flow.id} data={flow} deleteFlow={deleteGraph} />
              ))}
            </div>

            <div className={styles["content__main__line"]}>
              <tds-divider orientation="horizontal"></tds-divider>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
