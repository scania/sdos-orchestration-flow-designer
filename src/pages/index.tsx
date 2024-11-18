import { env } from "@/lib/env";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeProvider";
import axios from "axios";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Card from "@/components/Card/Card";
import Panel from "@/components/Tabs/Panel";
import styles from "./landing.module.scss";
import Tabs from "@/components/Tabs/Tabs";
import TaskSelection from "@/components/TaskSelection";
import { Task } from "@/utils/types";

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
  isDraft: Boolean;
  user: {
    email: string;
    id: "string";
    name: "string";
  };
}

function App({
  initialFlows,
  baseUrl,
}: {
  initialFlows: Flow[];
  baseUrl: string;
}) {
  const { theme } = useTheme();
  const [flows, setFlows] = useState<Flow[]>(initialFlows);
  const [executeGraphIriValue, setExecuteGraphIriValue] = useState<string>("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const {
    register: registerExecuteGraph,
    handleSubmit: handleSubmitExecuteGraph,
    formState: { errors: errorsExecuteGraph },
  } = useForm();

  const fetchFlows = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/flows`);
      setFlows(response.data);
    } catch (error) {
      console.error("Failed to fetch flows:", error);
    }
  };

  // TODO - Used to add event listener to modal, can probably be resolved with tegel/react
  useEffect(() => {
    let modal = document.querySelector("#execute-graph-iri-modal");
    modal.addEventListener("tdsClose", (event) => {
      handleModalClose();
    });
  }, []);

  // TODO - Add same functionality for all modals on the page
  const handleModalClose = () => {
    setExecuteGraphIriValue("");
  };

  const checkNameExists = async (name: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/flow/name-exists/${encodeURIComponent(
          `https://kg.scania.com/iris_orchestration/${name}`
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to check if name exists:", error);
      return false;
    }
  };

  const createNewGraph = async (data: {
    name: string;
    description: string;
  }) => {
    const { name, description } = data;
    clearErrors("name");
    const nameExists = await checkNameExists(name);
    if (nameExists) {
      setError("name", {
        type: "manual",
        message: "graph name already exists",
      });
      return;
    }
    router.push(
      {
        pathname: `/ofd/new`,
        query: {
          graphName: name.replace(/\s+/g, "-"),
          description,
        },
      },
      `/ofd/new`
    );
  };

  const handleExecute = (task: Task) => {
    router.push({
      pathname: `/executeFlow/iri/${encodeURIComponent(task.subjectIri)}`,
    });
  };
  return (
    <div className={`App`}>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <Tabs>
            {/* Manually create array in this in order to be able to map thru children in tabs component */}
            {[<Panel title="Graphs"></Panel>]}
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
              <Button id="execute-graph-button" type="button" variant="primary">
                <div className="tds-u-mr1">Execute Graph</div>
                <tds-icon name="send" size="16px"></tds-icon>
              </Button>
              <tds-modal selector="#create-new-graph-button" size="xs">
                <h5 className="tds-modal-headline" slot="header">
                  Create new graph
                </h5>
                <span slot="body">
                  <form onSubmit={handleSubmit(createNewGraph)}>
                    <tds-text-field
                      id="modal-name-field"
                      placeholder="Name"
                      size="sm"
                      mode-variant={theme === "light" ? "primary" : "secondary"}
                      helper={errors.name ? errors.name.message : ""}
                      state={errors.name ? "error" : "default"}
                      {...register("name", {
                        required: "graph name is required",
                        pattern: {
                          value: /^[a-zA-Z0-9\s]+$/,
                          message:
                            "graph name cannot contain special characters",
                        },
                      })}
                    />
                    <div style={{ marginTop: "28px" }} />
                    <tds-textarea
                      id="modal-description-area"
                      placeholder="Description"
                      rows={4}
                      mode-variant={theme === "light" ? "primary" : "secondary"}
                      {...register("description")}
                    />
                    <div style={{ marginTop: "28px" }} />
                    <span slot="actions">
                      <tds-button
                        size="md"
                        text="Create"
                        type="submit"
                        modeVariant="primary"
                      />
                    </span>
                  </form>
                </span>
              </tds-modal>
              {/* Execute Graph Modal */}
              <TaskSelection
                executeGraphIriValue={executeGraphIriValue}
                setExecuteGraphIriValue={setExecuteGraphIriValue}
                errorsExecuteGraph={errorsExecuteGraph}
                registerExecuteGraph={registerExecuteGraph}
                handleSubmitExecuteGraph={handleSubmitExecuteGraph}
                handleExecute={handleExecute}
                theme={theme}
                handleModalClose={handleModalClose}
                baseUrl={baseUrl}
              />
            </div>

            <h2 className={styles["content__headingContent"]}>Graphs</h2>

            <div className={styles["content__main__cards"]}>
              {flows && !!flows.length ? (
                <>
                  {flows.map((flow) => (
                    <Card
                      key={flow.id}
                      data={flow}
                      baseUrl={baseUrl}
                      fetchFlows={fetchFlows}
                    />
                  ))}
                </>
              ) : (
                <h5>No saved graphs found</h5>
              )}
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
