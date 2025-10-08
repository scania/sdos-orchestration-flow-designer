import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import { darkTheme } from "@uiw/react-json-view/dark";
import Modal from "@/components/Modal/CustomModal";
import { convertToLocalTime } from "@/helpers/helper";
import JsonView from "@uiw/react-json-view";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  TdsIcon,
  TdsButton,
  TdsTable,
  TdsTableHeader,
  TdsHeaderCell,
  TdsTableBody,
  TdsTableBodyRow,
  TdsBodyCell,
  TdsTableFooter,
} from "@scania/tegel-react";
import { useToast } from "@/hooks/useToast";
import Spinner from "@/components/Spinner/Spinner";

interface ExecutionResult {
  id: string;
  username: string;
  timeStamp: string;
  resultGraph: string;
  database: string;
  status: string;
  parameters?: any;
  error?: Record<"errorCode" | "message", string>;
}

interface ExecutionResultsProps {
  iri: string;
}

const ExecutionResults: React.FC<ExecutionResultsProps> = ({ iri }) => {
  const [tableData, setTableData] = useState<ExecutionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultGraphData, setResultGraphData] = useState<any>(null);
  const [resultGraphLoading, setResultGraphLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { showToast } = useToast();
  const rowsPerPage = 5;

  const getStatusIcon = (status: string): any => {
    const iconMap: Record<string, any> = {
      COMPLETE: "tick",
      FAILED: "cross",
      INCOMPLETE: "clock",
    };
    return <TdsIcon name={iconMap[status] || "error"} size="24px" />;
  };

  const handlePaginationEvent = (event: CustomEvent) => {
    const { detail } = event;
    setPage(detail.paginationValue);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/execute/results`, {
        params: {
          iri,
          paginationValue: page,
          rowsPerPage: rowsPerPage,
        },
      });
      const data = response.data.data;
      const paginationStatus = response.data.pagination;
      const { totalPages } = paginationStatus;
      const mappedData = data.map((item: any) => {
        const { date, time } = convertToLocalTime(item.createdAt);
        const data = {
          id: item.id,
          username: item.user?.name || "Unknown",
          timeStamp: `${date} ${time}`,
          resultGraph: item.resultGraphURI,
          status: item.status,
          parameters: item.executionParameters,
          database: item.database,
        };
        if (item.error) {
          return { ...data, error: item.error };
        }
        return data;
      });
      setTableData(mappedData);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching execution results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [iri, page, rowsPerPage]);

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

  const fetchResultGraph = async (resultGraph: string, database: string) => {
    try {
      setResultGraphLoading(true);
      const response = await axios.get(
        `/api/execute/result?resultGraph=${encodeURIComponent(
          resultGraph
        )}&database=${encodeURIComponent(database)}`
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

  const handleDelete = async (id: string, db: string) => {
    try {
      await axios.delete(
        `/api/execute/result?resultGraph=${encodeURIComponent(
          id
        )}&database=${encodeURIComponent(db)}`
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

  const renderStatus = (row: ExecutionResult) => {
    if (row.status === "NOT FOUND" && row.error)
      return (
        <Tooltip content={row.error.message} direction="right">
          {getStatusIcon(row.status)} {row.error.errorCode}
        </Tooltip>
      );
    return (
      <>
        {getStatusIcon(row.status)} {row.status}
        {row.status === "COMPLETE" && (
          <span
            onClick={(e) => {
              e.preventDefault();
              fetchResultGraph(row.resultGraph, row.database);
            }}
            title="View Result"
            className="pointer"
          >
            {` (View)`}
          </span>
        )}
      </>
    );
  };
  const renderTable = () => (
    <TdsTable
      tableId="pagination-table"
      verticalDividers={false}
      compactDesign={false}
      responsive
      noMinWidth
    >
      <TdsTableHeader>
        <TdsHeaderCell cellKey="userName" cellValue="User Name" />
        <TdsHeaderCell cellKey="startedAt" cellValue="Started At" />
        <TdsHeaderCell cellKey="database" cellValue="Database" />
        <TdsHeaderCell cellKey="graphUri" cellValue="Result Graph URI" />
        <TdsHeaderCell cellKey="parameters" cellValue="Parameters" />
        <TdsHeaderCell cellKey="status" cellValue="Status ">
          <span
            onClick={handleRefreshStatus}
            className="pointer"
            title="Refresh Status"
          >
            <TdsIcon name="refresh" size="24px"></TdsIcon>
          </span>
        </TdsHeaderCell>
        <TdsHeaderCell cellKey="actions" cellValue="Actions" />
      </TdsTableHeader>

      <TdsTableBody>
        {tableData.map((row) => (
          <TdsTableBodyRow key={row.id}>
            <TdsBodyCell cellKey="userName" cellValue={row.username} />
            <TdsBodyCell cellKey="startedAt" cellValue={row.timeStamp} />
            <TdsBodyCell cellKey="database" cellValue={row.database} />
            <TdsBodyCell cellKey="graphUri" cellValue={row.resultGraph} />
            <TdsBodyCell cellKey="parameters" cellValue="">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openParametersModal(row.parameters);
                }}
              >
                View Parameters
              </a>
            </TdsBodyCell>
            <TdsBodyCell cellKey="status" cellValue="">
              {renderStatus(row)}{" "}
            </TdsBodyCell>
            <TdsBodyCell cellKey="actions" cellValue="">
              <Tooltip content={"Delete Result Graph"} direction="bottom">
                <TdsButton
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(row.resultGraph, row.database);
                  }}
                  type="button"
                  variant="ghost"
                  size="xs"
                  tds-aria-label="Delete result graph"
                >
                  <TdsIcon slot="icon" size="18px" name="trash"></TdsIcon>
                </TdsButton>
              </Tooltip>
            </TdsBodyCell>
          </TdsTableBodyRow>
        ))}
      </TdsTableBody>

      <TdsTableFooter
        pagination
        // rowsPerPageValues={[5, 10]}
        rowsperpage={false}
        pages={totalPages}
        paginationValue={page}
        onTdsPagination={handlePaginationEvent}
      />
    </TdsTable>
  );
  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spinner />
        </div>
      ) : (
        renderTable()
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
