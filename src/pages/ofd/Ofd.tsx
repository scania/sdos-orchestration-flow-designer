import { GraphBody } from "@/services/graphSchema";
import {
  generateClassId,
  getPaths,
  isValidConnection,
  setEdgeProperties,
} from "@/utils";
import { ObjectProperties } from "@/utils/types.js";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Popover } from "react-tiny-popover";
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
import DynamicForm from "./DynamicForm";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./ofd.module.scss";
import { captureCursorPosition } from "../../lib/frontend/helper";
import { randomizeValue } from "../../helpers/helper";
import Toast, { ToastItem } from "@/components/Toast/Toast";
import ActionToolbar from "@/components/ActionToolbar/ActionToolbar";

const nodeTypes = {
  input: CircularNode,
  output: CircularNode,
  default: CircularNode,
};

interface Author {
  name: string;
  id: string;
  email: string;
}

interface ForceGraphProps {
  apiBaseUrl: string;
  author: Author;
  description?: string;
  graphName: string;
  initEdges?: Edge[];
  initNodes?: Node[];
  isEditable?: boolean;
  isDraftInitial?: boolean;
}

const ForceGraphComponent: React.FC<ForceGraphProps> = ({
  apiBaseUrl,
  description,
  author,
  graphName,
  initEdges,
  initNodes,
  isEditable = true,
  isDraftInitial = true,
}) => {
  const reactFlowWrapper = useRef(null);
  //@ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState();
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [droppedClassName, setDroppedClassName] = useState<null | string>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [edgeSelections, setEdgeSelections] = useState<string[]>([]);
  const [connectionParams, setConnectionParams] = useState<
    Edge<any> | Connection | null
  >(null);
  const graphDescription = description;
  const [targetNodePosition, setTargetNodePosition] = useState<any>({
    x: 0,
    y: 0,
  });
  const [isDraft, setIsDraft] = useState<boolean>(isDraftInitial);

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

  const showToast = (
    variant: string,
    header: string,
    description: string,
    timeout?: number
  ) => {
    const toastProperties = {
      variant,
      header,
      description,
      timeout,
    };
    setListOfToasts([...listOfToasts, toastProperties]);
  };

  const resetEdgeSelection = () => {
    setConnectionParams(null);
    setEdgeSelections([]);
    setTargetNodePosition({ x: 0, y: 0 });
    setIsPopoverOpen(false);
  };

  const isNodeDeletable = () => {
    if (!isEditable) return false;
    if (selectedNode?.data?.label === "Task") return false;
    return true;
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
    onSuccess: (data, variables) => {
      const { isDraft: savedAsDraft } = variables;
      showToast(
        "success",
        "Success",
        savedAsDraft
          ? "Draft has been successfully saved"
          : "Graph has been successfully saved"
      );
      setIsDraft(savedAsDraft);
    },
    onError: (error) => {
      showToast("error", "Error", "The graph could not be saved");
    },
  });

  // TODO: more comprehensive shacl validation,
  // this only checks for at least one input Parameter,
  // without which leads to sdos error
  const isGraphValid = (nodes: Node[], edges: Edge[]) => {
    const taskNodes = nodes.filter((node) => node.data.label === "Task");
    const invalidTasks = taskNodes.filter((task) => {
      const taskEdges = edges.filter(
        (edge) => edge.source === task.id || edge.target === task.id
      );
      // Check if any edge has the required label for inputParameter
      return !taskEdges.some(
        (edge) =>
          edge.data &&
          edge.data[
            "https://kg.scania.com/it/iris_orchestration/inputParameter"
          ]
      );
    });
    return invalidTasks.length === 0;
  };

  const handleSaveClick = (saveType: string) => {
    let isDraftSave = false;

    if (saveType === "draft") {
      isDraftSave = true;
    }
    if (!graphName) {
      showToast("error", "Validation Error", "Graph Name should be set");
    }
    if (!isGraphValid(nodes, edges) && !isDraftSave) {
      showToast(
        "error",
        "Validation Error",
        "Task node must be connected to at least one input Parameter."
      );
      return;
    }
    const payload = {
      nodes,
      edges,
      graphName: `https://kg.scania.com/iris_orchestration/${graphName}`,
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
      setIsPopoverOpen(true);
      captureCursorPosition(setTargetNodePosition);
      return;
    },
    [nodes]
  );

  const addToGraph = () => {
    if (!isEditable) return;
    const cleanedType = highlightedClassLabel.replace(/\s+/g, "");
    setDroppedClassName(cleanedType);
    // Get the bounding box of the graph area
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const viewport = reactFlowInstance.getViewport();
    const { x, y, zoom } = viewport;
    const position = {
      x: randomizeValue((width / 2 - x) / zoom),
      y: randomizeValue((height / 2 - y) / zoom),
    };

    // Store event-related data for later use
    setDropInfo({
      type: highlightedClassLabel,
      position: position,
    });

    setIsPendingClassDetailsAction(true);
    setHighlightedClassLabel("");
  };

  const onDragOver = useCallback((event: any) => {
    if (!isEditable) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      if (!isEditable) {
        return;
      }
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
    if (initNodes && initNodes.length > 0) {
      setNodes(initNodes);
    }
    if (initEdges && initEdges.length >= 0) {
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
  

  function handleClassOnDrag(e: React.DragEvent, nodeType: any) {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  /* 
    Set selected node on both click and drag start, same functionality
    but split into two functions due to the fact that we might want to
    have them behave differently after user-testing
  */
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleNodeDragStart = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handlePaneClick = () => {
    // If popover is open, close it when clicking outside popover
    setIsPopoverOpen(false);

    // De-select node when clicking outside a node, except when in setup-mode
    if (!setupMode) {
      setSelectedNode(null);
    }
  };

  const handleExecute = () => {
    if (isDraft) {
      showToast(
        "warning",
        "Cannot Execute",
        "Cannot execute a draft. Must be saved to execute"
      );
    } else {
      if (nodes.length === 0) {
        showToast(
          "error",
          "No Nodes",
          "Cannot execute an empty flow. Please add nodes to the graph."
        );
        return;
      }

      const firstNodeId = nodes[0].id;
      const iri = `https://kg.scania.com/it/iris_orchestration/${firstNodeId
        .split(":")
        .pop()}`;

      router.push(`/executeFlow/iri/${encodeURIComponent(iri)}`);
    }
  };

  return (
    <div className={styles.page}>
      <ActionToolbar
        graph={{
          name: graphName,
          description: description,
          isDraft: isDraft,
          author,
        }}
        toolbar
        handleExecute={handleExecute}
        handleSaveClick={handleSaveClick}
        isEditable={isEditable}
      />
      <div className={styles.page__main}>
        <Sidebar
          setupMode={setupMode}
          graphName={graphName}
          isLoading={isLoading}
          graphDescription={graphDescription}
          selectedNode={selectedNode}
          classes={classes}
          secondaryProperties={secondaryProperties}
          highlightedClassLabel={highlightedClassLabel}
          setHighlightedClassLabel={setHighlightedClassLabel}
          handleOnDrag={handleClassOnDrag}
          addToGraph={addToGraph}
          isEditable={isEditable}
        />

        <section className={styles.graph__canvas}>
          <div>
            <Popover
              isOpen={isPopoverOpen}
              content={
                <SelectionMenu
                  edges={edgeSelections}
                  onEdgeSelect={onEdgeSelect}
                  onClose={() => setIsPopoverOpen(false)}
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
                  onPaneClick={handlePaneClick}
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
                  onNodeDragStart={handleNodeDragStart}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  nodesDraggable={isEditable}
                  nodesConnectable={isEditable}
                >
                  <Controls style={{ display: "flex" }} position="top-center" />
                  {/* @ts-ignore */}
                  <Background />
                </ReactFlow>
                {setupMode && selectedNode && (
                  <div className={styles.form}>
                    <DynamicForm
                      key={selectedNode.id}
                      formData={selectedNode.data?.formData}
                      onSubmit={handleFormSubmit}
                      onClose={exitSetupMode}
                      className={selectedNode.data.label}
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
                    setSetupMode(true);
                    setHighlightedClassLabel("");
                  }}
                ></tds-button>
              ) : null}

              {setupMode ? (
                <tds-button
                  type="button"
                  variant="secondary"
                  size="md"
                  text="Leave setup"
                  mode-variant="secondary"
                  onClick={exitSetupMode}
                ></tds-button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      <Toast listOfToasts={listOfToasts} setListOfToasts={setListOfToasts} />
    </div>
  );
};

export default ForceGraphComponent;
