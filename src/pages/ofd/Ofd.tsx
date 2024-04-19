import { GraphBody } from "@/services/graphSchema";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useKeyPress,
  useNodesState,
} from "reactflow";
import Panel from "@/components/Tabs/Panel";
import Tabs from "@/components/Tabs/Tabs";
import "reactflow/dist/style.css";
import CircularNode from "../../components/CircularNode.tsx";
import Accordion from "../../components/Accordion/Accordion";
import { generateClassId, IClassConfig, setEdgeProperties } from "@/utils";
import DynamicForm from "./DynamicForm";
import styles from "./ofd.module.scss";

const initialNodes = [
  {
    id: generateClassId(),
    type: "input",
    data: {
      label: "Task",
      formData: {
        className: "Task",
        formFields: [
          {
            name: "label",
            type: "text",
            label: "Label",
            validation: {
              required: true,
              minLength: 1,
              maxLength: 50,
              message: "Label must be a string with 1 to 50 characters",
            },
            value: "",
          },
        ],
      },
    },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];
const nodeTypes = {
  input: CircularNode,
  output: CircularNode,
  default: CircularNode,
};

const ForceGraphComponent: React.FC = ({ apiBaseUrl }: any) => {
  const reactFlowWrapper = useRef(null);
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // TODO - mocked data to be replaced with api-call to recieve required and optional nodes
  // for a selected node and in setup-mode
  const [exampleClasses, setExampleClasses] = useState({
    required: [
      {
        category: "Action",
        className: "Action",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
      {
        category: "Action",
        className: "Yes no",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
      {
        category: "Action",
        className: "A cool name",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
      {
        category: "Action",
        className: "Searchable",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
    ],
    optional: [
      {
        category: "Action",
        className: "Placeholder name",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
      {
        category: "Action",
        className: "Testing things",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
      {
        category: "Action",
        className: "Searchable",
        parentClassUri: "https://kg.scania.com/it/iris_orchestration/Action",
        uri: "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
      },
    ],
  });

  const [selectedPrimaryCategory, setSelectedPrimaryCategory] =
    useState("Action");
  const [selectedSecondaryCategory, setSelectedSecondaryCategory] =
    useState("required");
  const [searchString, setSearchString] = useState("");
  const [showExtendedPanel, setShowExtendedPanel] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphDescription, setGraphDescription] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPendingClassDetailsAction, setIsPendingClassDetailsAction] =
    useState(false);

  const [highlightedClassLabel, setHighlightedClassLabel] =
    useState<string>("");
  const router = useRouter();
  const deletePressed = useKeyPress(["Delete"]);
  const [dropInfo, setDropInfo] = useState(null);
  const parseTtlMutation = useMutation((className: string) => {
    return axios.get(`${apiBaseUrl}/api/parse-ttl/?className=${className}`);
  });
  const [droppedClassName, setDroppedClassName] = useState<null | string>(null);
  const [setupMode, setSetupMode] = useState(false);
  const {
    data: classDetails,
    isLoading: isClassDetailsLoading,
    isError: isClassDetailsError,
  } = useQuery(
    ["classDetails", droppedClassName],
    () =>
      axios
        .get(`${apiBaseUrl}/api/parse-ttl/?className=${droppedClassName}`)
        .then((res) => res.data),
    {
      enabled: !!droppedClassName, // only fetch when selectedClassName is not null
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  useEffect(() => {
    exitSetupMode();
    setSelectedNode(null);
  }, [deletePressed]);

  const saveData = async (data: GraphBody) => {
    const response = await axios.post(`${apiBaseUrl}/api/persist`, data);
    return response.data;
  };

  const mutation = useMutation(saveData, {
    onSuccess: () => {
      setShowSuccessToast(true);
    },
    onError: (error) => {
      setShowErrorToast(true);
    },
  });

  useEffect(() => {
    let toastTimer: NodeJS.Timeout;

    if (showSuccessToast || showErrorToast) {
      toastTimer = setTimeout(() => {
        setShowSuccessToast(false);
        setShowErrorToast(false);
      }, 5000); // 5 seconds delay
    }

    return () => clearTimeout(toastTimer);
  }, [showSuccessToast, showErrorToast]);

  // Using this to prevent graphDescription to be null on page refresh
  useEffect(() => {
    if (localStorage.getItem("graphDescription")) {
      setGraphDescription(localStorage.getItem("graphDescription") as string);
    } else if (router.query.description) {
      setGraphDescription(router.query.description as string);
      localStorage.setItem(
        "graphDescription",
        router.query.description as string
      );
    }
  }, [router.query.description, router]);

  function filteredPrimaryClasses(classes: any) {
    const filteredPrimaryClasses = classes.filter(
      (item: any) =>
        item.category && item.category.includes(selectedPrimaryCategory)
    );

    if (searchString.length) {
      return filteredPrimaryClasses.filter(
        (item: any) =>
          item.className &&
          item.className.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    return filteredPrimaryClasses;
  }

  const handleSaveClick = () => {
    const payload = {
      nodes,
      edges,
      graphName: `http://example.org/${router.query?.graphName || "Private"}`,
    };
    mutation.mutate(payload);
  };

  const renderToasts = () => {
    return (
      <div className={styles.toast__absolute}>
        {showSuccessToast ? (
          <tds-toast
            variant="success"
            header="Graph Saved Successfully"
          ></tds-toast>
        ) : (
          <></>
        )}
        {showErrorToast ? (
          <tds-toast variant="error" header="Error Saving Graph"></tds-toast>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const handleFormSubmit = useCallback(
    (data: any) => {
      if (!selectedNode) return;
      setNodes((prevNodes) =>
        prevNodes.map((node: Node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, formData: data } }
            : node
        )
      );
    },
    [selectedNode, setNodes]
  );

  const exitSetupMode = useCallback(() => {
    setSelectedNode(null);
    setSetupMode(false);
  }, [setSelectedNode, setSetupMode]);

  const onConnect = useCallback(
    (params: Edge<any> | Connection) => {
      return setEdges((eds) => {
        const edge = addEdge(setEdgeProperties(nodes, params), eds);
        return edge;
      });
    },
    [nodes]
  );

  const addToGraph = () => {
    const cleanedType = highlightedClassLabel.replace(/\s+/g, "");
    setDroppedClassName(cleanedType);

    // Store event-related data for later use
    setDropInfo({
      type: highlightedClassLabel,
      position: { x: 10, y: 10 },
    });

    setIsPendingClassDetailsAction(true);
    setHighlightedClassLabel("");
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }
      const cleanedType = type.replace(/\s+/g, "");
      setDroppedClassName(cleanedType);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Store event-related data for later use
      setDropInfo({
        type: type,
        position,
      });

      setIsPendingClassDetailsAction(true);
    },
    [reactFlowInstance]
  );

  useEffect(() => {
    if (classDetails && isPendingClassDetailsAction && dropInfo) {
      setIsPendingClassDetailsAction(false);

      // Access stored event data
      const { type, position } = dropInfo;

      const newNode = {
        id: generateClassId(),
        type:
          type === "Task"
            ? "input"
            : type === "Result Action"
            ? "output"
            : "default",
        position,
        sourcePosition: "right",
        targetPosition: "left",
        data: {
          label: type,
          formData: classDetails,
        },
      };

      // Assuming setNodes updates your component state
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode));

      // Clear dropInfo if necessary
      setDropInfo(null);
    }
  }, [classDetails, isPendingClassDetailsAction, dropInfo]);

  const {
    data: classes,
    isLoading,
    error: classesError,
  } = useQuery(
    "classes",
    () =>
      axios
        .get(`${apiBaseUrl}/api/classes`)
        .then((res) => [
          { uri: "", className: "Task", parentClassUri: "" },
          ...res.data,
        ]),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  );

  const renderClasses = () => {
    if (classesError) {
      return (
        <tds-banner
          variant="error"
          header="Error"
          subheader="Error Fetching classes from stardog"
        >
          <tds-link slot="actions">
            <a href="/">Link example</a>
          </tds-link>
        </tds-banner>
      );
    }
    if (isLoading) {
      return <tds-spinner size="lg" variant="standard"></tds-spinner>;
    }
    return (
      <div className={styles.classes}>
        {classes &&
          filteredPrimaryClasses(classes).map(
            (
              item: {
                parentClassUri: string;
                className: string;
                category: string;
              },
              index: number
            ) => {
              return (
                <div
                  draggable
                  key={index}
                  onClick={() => setHighlightedClassLabel(item.className)}
                  onDragStart={(e: any) => handleOnDrag(e, item.className)}
                  className={`${styles.classes__class} ${
                    highlightedClassLabel === item.className
                      ? styles.active__chip
                      : styles.inactive__chip
                  }`}
                >
                  <div className={styles.classes__class__content}>
                    <div
                      className={`${styles.classes__class__content__icon} ${
                        highlightedClassLabel === item.className
                          ? styles.active__container
                          : ""
                      }`}
                    >
                      <tds-icon name="double_kebab" size="16px"></tds-icon>
                    </div>
                    <span className={styles.classes__class__content__label}>
                      {item.className}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        <div className={styles.classes__footer}>
          <tds-button
            type="button"
            variant="primary"
            size="sm"
            text="Add to graph"
            disabled={!highlightedClassLabel}
            onClick={() => addToGraph()}
          >
            <tds-icon slot="icon" size="16px" name="plus"></tds-icon>
          </tds-button>
        </div>
      </div>
    );
  };

  function handleOnDrag(e: React.DragEvent, nodeType: any) {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className={styles.page}>
      <header className={styles.page__header + " tds-detail-02"}>
        <div>
          <Link href="/">
            <span className={styles.page__header__back}>My work</span>
            <tds-icon slot="icon" size="14px" name="back"></tds-icon>
          </Link>
        </div>
        <div>
          <span className={styles.page__header__options}>Options</span>
          <span className={styles.page__header__save} onClick={handleSaveClick}>
            Save
          </span>
        </div>
      </header>
      <main className={styles.page__main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebar__header}>
            <div className={styles.sidebar__type_and_toggle}>
              {/* TODO - replace hardcoded "Private" value */}
              <h6 className="tds-detail-06">Private</h6>
              <tds-icon
                onClick={() => setShowExtendedPanel(!showExtendedPanel)}
                slot="icon"
                size="20px"
                name={showExtendedPanel ? "chevron_up" : "chevron_down"}
              ></tds-icon>
            </div>
            <h3 className={styles.sidebar__primaryHeading}>
              {router.query?.graphName || ""}
            </h3>
            <p className={styles.sidebar__description}>{graphDescription}</p>
          </div>
          {showExtendedPanel && !setupMode ? (
            // Primary panel
            <>
              <tds-divider orientation="horizontal"></tds-divider>
              <div className={styles.sidebar__search}>
                <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
                <tds-text-field
                  className="tds-text-field"
                  placeholder="Search..."
                  onInput={(e) => setSearchString(e.currentTarget.value)}
                />
              </div>
              <div className={styles.sidebar__tabs}>
                <Tabs
                  selected={0}
                  onParentClick={(value) => setSelectedPrimaryCategory(value)}
                >
                  <Panel title="Actions" value="Action"></Panel>
                  <Panel title="Parameters" value="Parameter"></Panel>
                  <Panel title="Scripts" value="Script"></Panel>
                </Tabs>
              </div>
              <div className={styles.sidebar__chips}>{renderClasses()}</div>
            </>
          ) : showExtendedPanel && setupMode ? (
            // Secondary panel
            <>
              <tds-divider orientation="horizontal"></tds-divider>
              <div className={styles.sidebar__search}>
                <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
                <tds-text-field
                  className="tds-text-field"
                  placeholder="Search..."
                  onInput={(e) => setSearchString(e.currentTarget.value)}
                />
              </div>
              <div className={styles.sidebar__tabs}>
                <Tabs
                  selected={0}
                  onParentClick={(value) => setSelectedSecondaryCategory(value)}
                >
                  <Panel title="Required" value="required"></Panel>
                  <Panel title="Optional" value="optional"></Panel>
                </Tabs>
              </div>
              <div className={styles.sidebar__chips}>
                <Accordion
                  label="Node name"
                  onButtonClick={() => alert("hey")}
                  button={true}
                  buttonText={"New"}
                  numberOfElements={
                    exampleClasses[selectedSecondaryCategory].length
                  }
                >
                  <div className={styles.classes}>
                    {exampleClasses &&
                      exampleClasses[selectedSecondaryCategory].map(
                        (
                          item: {
                            parentClassUri: string;
                            className: string;
                            category: string;
                          },
                          index: number
                        ) => {
                          return (
                            <div
                              draggable
                              key={index}
                              onClick={() =>
                                setHighlightedClassLabel(item.className)
                              }
                              onDragStart={(e: any) =>
                                handleOnDrag(e, item.className)
                              }
                              className={`${styles.classes__class} ${
                                highlightedClassLabel === item.className
                                  ? styles.active__chip
                                  : styles.inactive__chip
                              }`}
                            >
                              <div className={styles.classes__class__content}>
                                <div
                                  className={`${
                                    styles.classes__class__content__icon
                                  } ${
                                    highlightedClassLabel === item.className
                                      ? styles.active__container
                                      : ""
                                  }`}
                                >
                                  <tds-icon
                                    name="double_kebab"
                                    size="16px"
                                  ></tds-icon>
                                </div>
                                <span
                                  className={
                                    styles.classes__class__content__label
                                  }
                                >
                                  {item.className}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                </Accordion>

                <div className={styles.classes__footer}>
                  <tds-button
                    type="button"
                    variant="primary"
                    size="sm"
                    text="Add to graph"
                    disabled={!highlightedClassLabel}
                    onClick={() => addToGraph()}
                  >
                    <tds-icon slot="icon" size="16px" name="plus"></tds-icon>
                  </tds-button>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </aside>
        <section className={styles.graph__canvas}>
          <div>
            <ReactFlowProvider>
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={{
                  height: "calc(100vh - 200px)",
                  position: "relative",
                }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  deleteKeyCode={"Delete"}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  fitViewOptions={{ maxZoom: 1 }}
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
                  // onPaneClick={exitSetupMode}
                >
                  <Controls style={{ display: "flex" }} position="top-center" />
                  {/* @ts-ignore */}
                  <Background />
                </ReactFlow>
                {setupMode ? (
                  <div className={styles.form}>
                    <DynamicForm
                      key={selectedNode.id}
                      classConfig={selectedNode.data?.classData}
                      formData={selectedNode.data?.formData}
                      onSubmit={handleFormSubmit}
                      onClose={exitSetupMode}
                      label={selectedNode.data.label}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </ReactFlowProvider>
            <div className={styles["setup-button"]}>
              {selectedNode && !setupMode ? (
                <tds-button
                  type="button"
                  variant="primary"
                  size="md"
                  text="Enter Setup"
                  mode-variant="primary"
                  onClick={() => {
                    setSetupMode(true);
                  }}
                ></tds-button>
              ) : (
                <></>
              )}

              {setupMode ? (
                <tds-button
                  type="button"
                  variant="secondary"
                  size="md"
                  text="Leave setup"
                  mode-variant="secondary"
                  onClick={() => {
                    exitSetupMode();
                  }}
                ></tds-button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </section>
      </main>
      {renderToasts()}
    </div>
  );
};

export default ForceGraphComponent;
