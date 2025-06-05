import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import { darkTheme } from "@uiw/react-json-view/dark";
import Modal from "@/components/Modal/CustomModal";
import { convertToLocalTime } from "@/helpers/helper";
import JsonView from "@uiw/react-json-view";
import Tooltip from "@/components/Tooltip/Tooltip";
import { TdsIcon, TdsButton } from "@scania/tegel-react";
import { useToast } from "@/hooks/useToast";
import Spinner from "@/components/Spinner/Spinner";

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
  explorerUrl: string;
  resultGraphDB: string;
}

const ExecutionResults: React.FC<ExecutionResultsProps> = ({
  iri,
  explorerUrl,
  resultGraphDB,
}) => {
  const [tableData, setTableData] = useState<ExecutionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultGraphData, setResultGraphData] = useState<any>(null);
  const [resultGraphLoading, setResultGraphLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { showToast } = useToast();

  const getStatusIcon = (status: string): any => {
    const iconMap: Record<string, any> = {
      COMPLETE: "tick",
      FAILED: "cross",
      INCOMPLETE: "clock",
    };
    return <TdsIcon name={iconMap[status] || "error"} size="24px" />;
  };

  const fetchData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [iri]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkTheme(theme === "dark");
  }, []);

  const openParametersModal = (params: any) => {
    const safeParams = params && typeof params === "object" ? params : {};
    setSelectedParameters(safeParams);
    setIsParamsModalOpen(true);
  };

  const closeParamsModal = () => {
    setIsParamsModalOpen(false);
    setSelectedParameters(null);
  };

  const fetchResultGraph = async (resultGraph: string) => {
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
      {loading ? (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spinner />
        </div>
      ) : (
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
                  className="pointer"
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
                    <>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          fetchResultGraph(row.resultGraph);
                        }}
                        title="View Result"
                        className="pointer"
                        style={{
                          marginLeft: "8px",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                      >
                        (View)
                      </span>
                      <Tooltip
                        content={"Open in Stardog Explorer"}
                        direction="bottom"
                      >
                        <a
                          href={`${explorerUrl}/u/0/explorer/#/graph?db=${resultGraphDB}&graph=${encodeURIComponent(
                            row.resultGraph
                          )}&reasoning`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in Stardog Explorer"
                          style={{ marginLeft: "8px", verticalAlign: "middle" }}
                        >
                          <TdsIcon name="redirect" size="24px" />
                        </a>
                      </Tooltip>
                    </>
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
      )}

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
              style={isDarkTheme ? darkTheme : undefined}
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
            <Spinner />
          ) : resultGraphData ? (
            <JsonView
              value={resultGraphData}
              indentWidth={4}
              style={isDarkTheme ? darkTheme : undefined}
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
    </div>
  );
};

export default ExecutionResults;
