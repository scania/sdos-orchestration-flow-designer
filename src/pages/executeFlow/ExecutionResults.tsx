import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";
import Modal from "@/components/Modal/CustomModal";
import { convertToLocalTime } from "@/helpers/helper";
import JsonView from "@uiw/react-json-view";
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
          status: item.resultGraphURI ? "Result" : "Executing...",
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

  return (
    <div style={{ padding: "20px" }}>
      <table className={styles.table}>
        <thead className={styles.table__header}>
          <tr>
            <th>User Name</th>
            <th>Started At</th>
            <th>Result Graph URI</th>
            <th>Parameters</th>
            <th>Result</th>
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
              <td style={{ cursor: "pointer" }}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    </div>
  );
};

export default ExecutionResults;
