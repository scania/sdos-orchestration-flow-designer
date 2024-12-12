import { env } from "@/lib/env";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeProvider";
import axios from "axios";
import { useForm } from "react-hook-form";
import Card from "@/components/Card/Card";
import Panel from "@/components/Tabs/Panel";
import styles from "./landing.module.scss";
import Tabs from "@/components/Tabs/Tabs";
import {
  TdsIcon,
  TdsDivider,
  TdsModal,
  TdsButton,
  TdsTextField,
  TdsTextarea,
} from "@scania/tegel-react";
import TaskSelection from "@/components/TaskSelection";
import { Task } from "@/utils/types";
import Toast, { ToastItem } from "@/components/Toast/Toast";

// Server-side authentication check
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
      userId: session.user.id,
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
    id: string;
    name: string;
  };
}

function App({
  initialFlows,
  baseUrl,
  userId,
}: {
  initialFlows: Flow[];
  baseUrl: string;
  userId: string;
}) {
  const { theme } = useTheme();
  const [flows, setFlows] = useState<Flow[]>(initialFlows);
  const [selectedTab, setSelectedTab] = useState<string>("My Work");
  const [executeGraphIriValue, setExecuteGraphIriValue] = useState<string>("");
  const [listOfToasts, setListOfToasts] = useState<ToastItem[]>([]);
  const [toBeDeletedId, setToBeDeletedId] = useState<string | null>(null);
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

  const handleTabClick = (value: string) => {
    setSelectedTab(value);
  };

  const displayedFlows = flows.filter((flow) =>
    selectedTab === "My Work"
      ? flow.user.id === userId
      : flow.user.id !== userId
  );

  const heading = selectedTab;
  const description =
    selectedTab === "My Work"
      ? "Open and edit your orchestration flow graph or create a new one. You can also view what graphs are available to you from others."
      : "View graphs available to you from other projects.";

  const onDeleteGraphClick = (id: string, ownerId: string) => {
    const modal = document.querySelector(
      '[selector="delete-graph-modal"]'
    ) as HTMLTdsModalElement | null;
    if (modal) {
      setToBeDeletedId(id);
      modal.showModal();
    }
  };

  const onGraphDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/api/flow/${toBeDeletedId}`);
      await fetchFlows();
      showToast("success", "Success", "Graph has been deleted");
      setToBeDeletedId(null);
    } catch (error) {
      showToast("error", "Error", "Graph cannot be deleted");
      setToBeDeletedId(null);
    }
  };

  const showToast = useCallback(
    (
      variant: "success" | "error" | "information" | "warning",
      header: string,
      description: string
    ) => {
      const toastProperties: ToastItem = { variant, header, description };
      setListOfToasts((prevToasts) => [...prevToasts, toastProperties]);
    },
    []
  );

  const fetchFlows = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/flows`);
      const flows = response.data;
      setFlows(flows);
    } catch (error) {
      console.error("Failed to fetch flows:", error);
    }
  };

  useEffect(() => {
    let modal = document.querySelector("#execute-graph-iri-modal");
    modal?.addEventListener("tdsClose", handleModalClose);
  }, []);

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
    const nameExists = await checkNameExists(name.replace(/\s+/g, "-"));
    if (nameExists) {
      setError("name", {
        type: "manual",
        message: "Graph name already exists",
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
      <tds-modal
        id="delete-graph-modal"
        selector="delete-graph-modal"
        size="sm"
      >
        <h5 className="tds-modal-headline" slot="header">
          Are you sure?
        </h5>
        <span slot="body">This action once performed, cannot be reverted</span>
        <span
          slot="actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <tds-button
            data-dismiss-modal
            size="md"
            text="Delete"
            variant="danger"
            onClick={onGraphDelete}
          ></tds-button>
        </span>
      </tds-modal>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <Tabs selected={0} onParentClick={handleTabClick}>
            <Panel title="My Work" value="My Work"></Panel>
            <Panel title="Other Flows" value="Other Flows"></Panel>
          </Tabs>
        </div>
        <div className={styles.content}>
          <div className={styles["header__project-summary"]}>
            <h2 className={styles["content__heading"]}>{heading}</h2>
            <p className={styles["content__description"]}>{description}</p>
          </div>
          <div className={styles["content__main"]}>
            <div className={styles["content__main__buttons"]}>
              <tds-button
                id="create-new-graph-button"
                size="sm"
                variant="primary"
                text={"Create new graph"}
              >
                <tds-icon size="16px" slot="icon" name="plus"></tds-icon>
              </tds-button>
              <tds-button
                id="execute-graph-button"
                size="sm"
                variant="primary"
                text={"Execute Graph"}
              >
                <tds-icon size="16px" slot="icon" name="send"></tds-icon>
              </tds-button>
              <TdsModal selector="#create-new-graph-button" size="xs">
                <h5 className="tds-modal-headline" slot="header">
                  Create new graph
                </h5>
                <span slot="body">
                  <form onSubmit={handleSubmit(createNewGraph)}>
                    <TdsTextField
                      id="modal-name-field"
                      placeholder="Name"
                      size="sm"
                      mode-variant={theme === "light" ? "primary" : "secondary"}
                      helper={errors.name ? errors.name.message : ""}
                      state={errors.name ? "error" : "default"}
                      {...register("name", {
                        required: "Graph name is required",
                        pattern: {
                          value: /^[a-zA-Z0-9\s]+$/,
                          message:
                            "Graph name cannot contain special characters",
                        },
                      })}
                    />
                    <div style={{ marginTop: "28px" }} />
                    <TdsTextarea
                      id="modal-description-area"
                      placeholder="Description"
                      rows={4}
                      mode-variant={theme === "light" ? "primary" : "secondary"}
                      {...register("description")}
                    />
                    <div style={{ marginTop: "28px" }} />
                    <span slot="actions">
                      <TdsButton
                        size="md"
                        text="Create"
                        type="submit"
                        modeVariant="primary"
                      />
                    </span>
                  </form>
                </span>
              </TdsModal>
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
              {displayedFlows && displayedFlows.length ? (
                displayedFlows.map((flow) => (
                  <Card
                    key={flow.id}
                    data={flow}
                    deleteGraph={onDeleteGraphClick}
                  />
                ))
              ) : (
                <h5>No graphs available</h5>
              )}
            </div>
            <div className={styles["content__main__line"]}>
              <TdsDivider orientation="horizontal"></TdsDivider>
            </div>
          </div>
        </div>
        <Toast listOfToasts={listOfToasts} setListOfToasts={setListOfToasts} />
      </main>
    </div>
  );
}

export default App;
