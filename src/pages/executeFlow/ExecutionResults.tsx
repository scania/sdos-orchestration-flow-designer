import React, { useEffect, useState } from 'react';
import styles from "./ExecuteFlow.module.scss";

const ExecutionResults = () => {
  const [tableData, setTableData] = useState([]);

  const fetchData = async () => {
    const response = [
        { id: 1, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'Cool graph', status: 'Executing...' },
        { id: 2, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'My new flow', status: 'Result' },
        { id: 3, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'Old', status: 'Result' },
        { id: 4, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'Test123', status: 'Result' },
        { id: 5, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'Test', status: 'Executing...' },
        { id: 6, user: 'John Doe', timeStamp: "2024-01-01", graphName: 'New(1)', status: 'Result' },
    ];

    setTableData(response);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch new data every 5 sec
    return () => clearInterval(interval);
  }, []);

  const showResult = () => {
    alert("Showing result")
  }

  return (
    <div style={{padding: '20px'}}>

    <table className={styles.table}>
        <thead className={styles.table__header}>
            <tr>
                <th>User</th>
                <th>Timestamp</th>
                <th>Graph name</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody className={styles.table__body}>
        {tableData.map((row) => (
          <tr key={row.id}>
            <td>{row.user}</td>
            <td>{row.timeStamp}</td>
            <td>{row.graphName}</td>
            <td onClick={() => showResult()}>{row.status}</td>
          </tr>
        ))}

        </tbody>
    </table>
    </div>

  );
};

export default ExecutionResults;
