import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import Modal from "@/components/Modal/CustomModal";
import { convertToLocalTime } from "@/helpers/helper";
import JsonView from "@uiw/react-json-view";
import Tooltip from "@/components/Tooltip/Tooltip";
import { TdsIcon, TdsButton } from "@scania/tegel-react";
import Toast, { ToastItem } from "@/components/Toast/Toast";

interface ExecutionResult {
  id: string;
  username: string;
  timeStamp: string;
  resultGraph: string;
  status: string;
  parameters?: any;
}

interface ExecutionResultsProps {
  iri: string;
}

const ExecutionResults: React.FC<ExecutionResultsProps> = ({ iri }) => {
  const [tableData, setTableData] = useState<ExecutionResult[]>([]);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultGraphData, setResultGraphData] = useState<any>(null);
  const [resultGraphLoading, setResultGraphLoading] = useState(false);
  const [listOfToasts, setListOfToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (
      variant: "success" | "error" | "information" | "warning",
      header: string,
      description: string,
      timeout?: number
    ) => {
      const toastProperties: ToastItem = {
        variant,
        header,
        description,
        timeout,
      };
      setListOfToasts((prevToasts) => [...prevToasts, toastProperties]);
    },
    []
  );

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case "COMPLETE":
        return <TdsIcon name="tick" size="24px"></TdsIcon>;
      case "FAILED":
        return <TdsIcon name="cross" size="24px"></TdsIcon>;
      case "INCOMPLETE":
        return <TdsIcon name="clock" size="24px"></TdsIcon>;
      default:
        return <TdsIcon name="error" size="24px"></TdsIcon>;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `/api/execute/results?iri=${encodeURIComponent(iri)}`
      );
      const mappedData = response.data.map((item: any) => {
        const { date, time } = convertToLocalTime(item.createdAt);
        return {
          id: item.id,
          username: item.user?.name || "Unknown",
          timeStamp: `${date} ${time}`,
          resultGraph: item.resultGraphURI,
          status: item.status,
          parameters: item.executionParameters,
        };
      });
      setTableData(mappedData);
    } catch (error) {
      console.error("Error fetching execution results:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [iri]);

  const openParametersModal = (params: any) => {
    const safeParams = params && typeof params === "object" ? params : {};
    setSelectedParameters(safeParams);
    setIsParamsModalOpen(true);
  };

  const closeParamsModal = () => {
    setIsParamsModalOpen(false);
    setSelectedParameters(null);
  };

  const openResultModal = async (resultGraph: string) => {
    try {
      setResultGraphLoading(true);
      const response = await axios.get(
        `/api/execute/result?resultGraph=${encodeURIComponent(resultGraph)}`
      );
      setResultGraphData(response.data);
      setIsResultModalOpen(true);
    } catch (error) {
      console.error("Error fetching result graph:", error);
      setResultGraphData({ error: "Failed to load result graph." });
      setIsResultModalOpen(true);
    } finally {
      setResultGraphLoading(false);
    }
  };

  const closeResultModal = () => {
    setIsResultModalOpen(false);
    setResultGraphData(null);
  };

  const handleRefreshStatus = async () => {
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `/api/execute/result?resultGraph=${encodeURIComponent(id)}`
      );
      showToast(
        "success",
        "Success",
        "Execution result deleted successfully",
        3000
      );
      fetchData();
    } catch (error) {
      console.error("Error deleting execution result:", error);
      showToast("error", "Error", "Failed to delete execution result", 3000);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <table className={styles.table}>
        <thead className={styles.table__header}>
          <tr>
            <th>User Name</th>
            <th>Started At</th>
            <th>Result Graph URI</th>
            <th>Parameters</th>
            <th>
              Status{" "}
              <span
                onClick={handleRefreshStatus}
                style={{ cursor: "pointer" }}
                title="Refresh Status"
              >
                <TdsIcon name="refresh" size="24px"></TdsIcon>
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={styles.table__body}>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td>{row.username}</td>
              <td>{row.timeStamp}</td>
              <td>{row.resultGraph}</td>
              <td>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openParametersModal(row.parameters);
                  }}
                >
                  View Parameters
                </a>
              </td>
              <td>
                {getStatusIcon(row.status)} {row.status}
                {row.status === "COMPLETE" && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      openResultModal(row.resultGraph);
                    }}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                      marginLeft: "8px",
                    }}
                    title="View Result"
                  >
                    View
                  </span>
                )}
              </td>
              <td>
                <Tooltip content={"Delete Result Graph"} direction="bottom">
                  <TdsButton
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(row.resultGraph);
                    }}
                    type="primary"
                    variant="danger"
                    size="sm"
                    tds-aria-label="Delete result graph"
                  >
                    <TdsIcon slot="icon" size="20px" name="trash"></TdsIcon>
                  </TdsButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for viewing execution parameters */}
      <Modal
        isOpen={isParamsModalOpen}
        onRequestClose={closeParamsModal}
        title="Execution Parameters"
        width="md"
      >
        <div>
          {selectedParameters && Object.keys(selectedParameters).length > 0 ? (
            <JsonView
              value={selectedParameters}
              indentWidth={4}
              displayDataTypes={false}
              collapsed={false}
              displayObjectSize={true}
              enableClipboard={true}
            />
          ) : (
            <p>No parameters available.</p>
          )}
        </div>
      </Modal>

      {/* Modal for viewing result graph */}
      <Modal
        isOpen={isResultModalOpen}
        onRequestClose={closeResultModal}
        title="Result Graph"
        width="lg"
      >
        <div>
          {resultGraphLoading ? (
            <p>Loading...</p>
          ) : resultGraphData ? (
            <JsonView
              value={resultGraphData}
              indentWidth={4}
              displayDataTypes={false}
              collapsed={false}
              displayObjectSize={true}
              enableClipboard={true}
            />
          ) : (
            <p>No result data available.</p>
          )}
        </div>
      </Modal>

      <Toast listOfToasts={listOfToasts} setListOfToasts={setListOfToasts} />
    </div>
  );
};

export default ExecutionResults;
