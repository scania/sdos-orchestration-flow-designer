import { env } from "@/lib/env";
import { useState } from "react";
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
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const fetchFlows = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/flows`);
      setFlows(response.data);
    } catch (error) {
      console.error("Failed to fetch flows:", error);
    }
  };

  const checkNameExists = async (name: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/flow/name-exists/${encodeURIComponent(
          `http://example.org/${name}`
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
              <tds-modal selector="#execute-graph-button" size="xs">
                <h5 className="tds-modal-headline" slot="header">
                  Execute Graph with IRI
                </h5>
                <span slot="body">
                  <form onSubmit={handleSubmit(() => {})}>
                    <tds-text-field
                      id="modal-name-field"
                      placeholder="https://example.com/test"
                      size="sm"
                      mode-variant={theme === "light" ? "primary" : "secondary"}
                      helper={errors.name ? errors.name.message : ""}
                      state={errors.name ? "error" : "default"}
                      {...register("iri", {
                        required: "Graph IRI is required",
                        pattern: {
                          value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
                          message:
                            "Please enter a valid IRI (URL format required)",
                        },
                      })}
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
              <Button type="button" variant="secondary">
                <div className="tds-u-mr1">Find graph to reuse</div>
                <tds-icon name="redirect" size="16px"></tds-icon>
              </Button>
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
