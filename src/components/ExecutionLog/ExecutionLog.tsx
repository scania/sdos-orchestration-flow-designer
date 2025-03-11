import { useState, useEffect } from "react";
import Spinner from "../Spinner/Spinner";
import styles from "./ExecutionLog.module.scss";

interface LogItem {
  status: string;
  message: string;
}

interface ExecutionLogProps {
  executionLog: LogItem[] | null;
}

const ExecutionLog: React.FC<ExecutionLogProps> = ({ executionLog }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeoutReached, setTimeoutReached] = useState<boolean>(false);

  const styleMapping: {
    [key: string]: {
      iconColor: string;
      borderColor: string;
      backgroundColor: string;
    };
  } = {
    INFO: {
      iconColor: "rgba(43,112,211, 1)",
      borderColor: "rgba(43,112,211, .75)",
      backgroundColor: "rgba(43,112,211, .1)",
    },
    ERROR: {
      iconColor: "rgba(255, 35, 64, 1)",
      borderColor: "rgba(255, 35, 64, 0.75)",
      backgroundColor: "rgba(255, 35, 64, 0.1)",
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!executionLog || executionLog.length === 0) {
        setTimeoutReached(true); 
      }
    }, 10000);

    if (executionLog && executionLog.length > 0) {
      setLoading(false);
    }

    return () => clearTimeout(timer);
  }, [executionLog]); 

  if (timeoutReached) {
    return <div className={styles.stateMessageContainer}>Could not load the execution log.</div>;
  }

  return (
    <div className={styles.executionLogContainer}>
      {loading ? (
        <Spinner />
      ) : (
        executionLog?.map((logItem, index) => {
          // Safely get style values from styleMapping or provide defaults
          const { iconColor, borderColor, backgroundColor } = styleMapping[logItem.status] || {
            iconColor: "gray",
            borderColor: "gray",
            backgroundColor: "lightgray",
          };

          return (
            <div
              key={index}
              className={styles.executionLogItem}
              style={{
                border: `1px solid ${borderColor}`,
                borderLeft: `5px solid ${borderColor}`,
                background: `${backgroundColor}`,
              }}
            >
              <tds-icon
                style={{ color: iconColor }}
                name="info"
                size="22px"
              ></tds-icon>
              <div>{logItem.message}</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ExecutionLog;
