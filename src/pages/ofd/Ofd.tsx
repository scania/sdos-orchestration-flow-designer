import { GraphBody } from "@/services/graphSchema";
import {
  generateClassId,
  initializeNodes,
  getPaths,
  isValidConnection,
  setEdgeProperties,
} from "@/utils";
import { ObjectProperties } from "@/utils/types.js";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import { Popover } from "react-tiny-popover";
import { useSession } from "next-auth/react";
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
import "reactflow/dist/style.css";
import CustomEdge from "../../components/CustomEdge/CustomEdge";
import SelectionMenu from "../../components/ActionsMenu/EdgeSelectionMenu";
import CircularNode from "../../components/CircularNode.tsx";
import GraphOptions from "../../components/GraphOptions/GraphOptions";
import DynamicForm from "./DynamicForm";
import Sidebar from "./Sidebar";
import styles from "./ofd.module.scss";
import { captureCursorPosition } from "../../lib/frontend/helper";
import Toast, { ToastItem } from "@/components/Toast/Toast";

const initialNodes = initializeNodes();
const nodeTypes = {
  input: CircularNode,
  output: CircularNode,
  default: CircularNode,
};

const ForceGraphComponent: React.FC = ({
  apiBaseUrl,
  description,
  graphName,
  initEdges,
  initNodes,
  isEditable = true,
}: any) => {
  const reactFlowWrapper = useRef(null);
  const { data: session } = useSession();
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] =
    useState("Action");
  const [searchString, setSearchString] = useState("");
  const [showExtendedPanel, setShowExtendedPanel] = useState(true);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [listOfToasts, setListOfToasts] = useState<ToastItem[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPendingClassDetailsAction, setIsPendingClassDetailsAction] =
    useState(false);

  const [highlightedClassLabel, setHighlightedClassLabel] =
    useState<string>("");
  const router = useRouter();
  const deletePressed = useKeyPress(["Delete"]);
  const [dropInfo, setDropInfo] = useState(null);
  const [droppedClassName, setDroppedClassName] = useState<null | string>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [edgeSelections, setEdgeSelections] = useState<string[]>([]);
  const [connectionParams, setConnectionParams] = useState<
    Edge<any> | Connection | null
  >(null);
  const graphDescription = description || router.query.description || "";
  const [targetNodePosition, setTargetNodePosition] = useState<any>({
    x: 0,
    y: 0,
  });
  const {
    data: classDetails,
    isLoading: isClassDetailsLoading,
    isError: isClassDetailsError,
  } = useQuery(
    ["classDetails", droppedClassName],
    () =>
      axios
        .get(`${apiBaseUrl}/api/parse-ttl/?className=${droppedClassName}`)
        .then((res) => res.data)
        .catch((res) => {
          showToast("error", "Error", res.response.data.error);
        }),
    {
      enabled: !!droppedClassName, // only fetch when selectedClassName is not null
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  const showToast = (variant, header, description) => {
    const toastProperties = {
      variant,
      header,
      description,
    };
    setListOfToasts([...listOfToasts, toastProperties]);
  };

  const resetEdgeSelection = () => {
    setConnectionParams(null);
    setEdgeSelections([]);
    setTargetNodePosition({ x: 0, y: 0 });
  };

  const isNodeDeletable = () => {
    if (selectedNode?.data?.label !== "Task") {
      return true;
    }
  };

  const onEdgeSelect = (path: string) => {
    setEdges((eds) => {
      if (!connectionParams) return;
      const edge = addEdge(setEdgeProperties(connectionParams, path), eds);
      return edge;
    });
    resetEdgeSelection();
  };

  const secondaryProperties = useMemo(() => {
    const cachedData = selectedNode?.data.formData?.objectProperties || [];
    if (cachedData) {
      // Process cachedData as needed, excluding connectors for main flow
      return cachedData.filter(
        (item: ObjectProperties) =>
          ![
            "https://kg.scania.com/it/iris_orchestration/hasAction",
            "https://kg.scania.com/it/iris_orchestration/hasNextAction",
          ].includes(item.path)
      );
    }
    return [];
  }, [selectedNode, setupMode]);

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
      showToast("success", "Success", "Graph has been successfully saved");
    },
    onError: (error) => {
      showToast("error", "Error", "The graph could not be saved");
    },
  });

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

  const handleSaveClick = (isDraftSave) => {
    const payload = {
      nodes,
      edges,
      graphName: `https://kg.scania.com/iris_orchestration/${
        router.query?.graphName || graphName || "Private"
      }`,
      description: graphDescription,
      isDraft: isDraftSave,
    };
    mutation.mutate(payload);
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
    setHighlightedClassLabel("");
  }, [setSelectedNode, setSetupMode]);

  const edgeTypes = {
    "custom-edge": CustomEdge,
  };

  const onConnect = useCallback(
    (params: Edge<any> | Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);
      const paths = getPaths({ sourceNode, targetNode });
      if (!paths.length) return;
      if (paths.length === 1) {
        return setEdges((eds) => {
          const edge = addEdge(setEdgeProperties(params, paths[0]), eds);
          return edge;
        });
      }
      setConnectionParams(params);
      setEdgeSelections([...paths]);
      captureCursorPosition(setTargetNodePosition);
      return;
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
    // Initialize state from props if they are provided and not empty
    if (
      initNodes &&
      initEdges &&
      initNodes.length > 0 &&
      initEdges.length > 0
    ) {
      setNodes(initNodes);
      setEdges(initEdges);
    }
  }, []);

  useEffect(() => {
    if (classDetails && isPendingClassDetailsAction && dropInfo) {
      setIsPendingClassDetailsAction(false);

      // Access stored event data
      const { type, position } = dropInfo;

      const newNode = {
        id: generateClassId(),
        type: type === "Task" ? "input" : "default",
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

  const { data: classes, isLoading } = useQuery(
    "classes",
    () =>
      axios
        .get(`${apiBaseUrl}/api/classes`)
        .then((res) => [
          { uri: "", className: "Task", parentClassUri: "" },
          ...res.data,
        ])
        .catch(() => {
          showToast("error", "Error", "Could not fetch classes from Stardog");
        }),
    {
      staleTime: Infinity,
    }
  );

  const renderClasses = () => {
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
                  draggable={isEditable}
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
            disabled={!highlightedClassLabel || !isEditable}
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
            <span className={styles.page__header__back}>Back</span>
            <tds-icon slot="icon" size="14px" name="back"></tds-icon>
          </Link>
        </div>
        <div>
          <GraphOptions
            selector="#graph-options"
            graphDescription={graphDescription}
            graphName={router.query.graphName || graphName || ""}
          />
          <span id="graph-options" className={styles.page__header__action}>
            Options
          </span>
          <span
            id="execute-graph"
            className={styles.page__header__action}
            onClick={() =>
              router.push(
                `/executeFlow/iri/${encodeURIComponent(
                  `https://kg.scania.com/it/iris_orchestration/${nodes[0].id
                    .split(":")
                    .pop()}`
                )}`
              )
            }
          >
            Execute
          </span>
          {isEditable ? (
            <>
              <span
                className={styles.page__header__action}
                onClick={() => handleSaveClick(true)}
              >
                Save Draft
              </span>
              <span
                className={styles.page__header__action}
                onClick={() => handleSaveClick(false)}
              >
                Save
              </span>
            </>
          ) : (
            <></>
          )}
        </div>
      </header>
      <main className={styles.page__main}>
        <Sidebar
          showExtendedPanel={showExtendedPanel}
          setShowExtendedPanel={setShowExtendedPanel}
          setupMode={setupMode}
          graphName={router.query.graphName || graphName || ""}
          graphDescription={graphDescription}
          searchString={searchString}
          setSearchString={setSearchString}
          selectedPrimaryCategory={selectedPrimaryCategory}
          setSelectedPrimaryCategory={setSelectedPrimaryCategory}
          renderClasses={renderClasses}
          secondaryProperties={secondaryProperties}
          highlightedClassLabel={highlightedClassLabel}
          setHighlightedClassLabel={setHighlightedClassLabel}
          handleOnDrag={handleOnDrag}
          addToGraph={addToGraph}
        />

        <section className={styles.graph__canvas}>
          <div>
            <Popover
              isOpen={!!edgeSelections.length}
              content={
                <SelectionMenu
                  edges={edgeSelections}
                  onEdgeSelect={onEdgeSelect}
                ></SelectionMenu>
              }
              containerStyle={{
                position: "fixed",
                left: `${targetNodePosition.x}px`,
                top: `${targetNodePosition.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div />
            </Popover>
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
                  deleteKeyCode={isNodeDeletable() ? "Delete" : null}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  isValidConnection={isValidConnection(nodes)}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  fitViewOptions={{ maxZoom: 1 }}
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  nodesDraggable={isEditable}
                  nodesConnectable={isEditable}
                >
                  <Controls style={{ display: "flex" }} position="top-center" />
                  {/* @ts-ignore */}
                  <Background />
                </ReactFlow>
                {setupMode && (
                  <div className={styles.form}>
                    <DynamicForm
                      key={selectedNode.id}
                      classConfig={selectedNode.data?.classData}
                      formData={selectedNode.data?.formData}
                      onSubmit={handleFormSubmit}
                      onClose={exitSetupMode}
                      label={selectedNode.data.label}
                      readOnly={!isEditable}
                    />
                  </div>
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
                    [setSetupMode(true), setHighlightedClassLabel("")];
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
      <Toast listOfToasts={listOfToasts} setListOfToasts={setListOfToasts} />
    </div>
  );
};

export default ForceGraphComponent;
