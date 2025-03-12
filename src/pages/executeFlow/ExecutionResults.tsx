import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ExecuteFlow.module.scss";

const ExecutionResults = ({ iri }) => {
  const [tableData, setTableData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `/api/execute/results?iri=${encodeURIComponent(iri)}`
      );
      const mappedData = response.data.map((item) => ({
        id: item.id,
        username: item.user?.name || "Unknown",
        timeStamp: new Date(item.createdAt).toLocaleString(),
        resultGraph: item.resultGraphURI,
        status: item.resultGraphURI ? "Result" : "Executing...",
      }));
      setTableData(mappedData);
    } catch (error) {
      console.error("Error fetching execution results:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [iri]);

  const showResult = (graphName: string) => {
    alert(`Showing result for: ${graphName}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <table className={styles.table}>
        <thead className={styles.table__header}>
          <tr>
            <th>User Name</th>
            <th>Time</th>
            <th>Result Graph URI</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody className={styles.table__body}>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td>{row.username}</td>
              <td>{row.timeStamp}</td>
              <td>{row.resultGraph}</td>
              <td
                onClick={() => showResult(row.resultGraph)}
                style={{ cursor: "pointer" }}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExecutionResults;
