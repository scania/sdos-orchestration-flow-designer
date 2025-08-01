import { useState, useEffect, useRef } from "react";
import Spinner from "../Spinner/Spinner";
import styles from "./ExecutionLog.module.scss";
import { TdsButton, TdsIcon } from "@scania/tegel-react";

interface LogItem {
  status: string;
  message: string;
}

interface ExecutionLogProps {
  executionLog: LogItem[] | null;
  onRefresh: () => void;
}

const styleMapping: Record<
  string,
  { iconColor: string; borderColor: string; backgroundColor: string }
> = {
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

const ExecutionLog: React.FC<ExecutionLogProps> = ({
  executionLog,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(
    !executionLog || executionLog.length === 0
  );
  const [timeoutReached, setTimeoutReached] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const beginTimeout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      /* if still loading after 10 s, give up */
      if (loading) setTimeoutReached(true);
    }, 10_000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeoutReached(false);
    beginTimeout();
    onRefresh();
  };

  useEffect(() => {
    if (loading) beginTimeout();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading]);

  useEffect(() => {
    if (executionLog && executionLog.length > 0) {
      setLoading(false);
      setTimeoutReached(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [executionLog]);

  if (timeoutReached) {
    return (
      <div>
        <div className={styles.stateMessageContainer}>
          Could not load the execution log, please refresh.
        </div>
        <TdsButton
          type="button"
          variant="secondary"
          size="sm"
          text="Refresh"
          animation="none"
          tds-aria-label="undefined"
          onClick={handleRefresh}
        >
          <TdsIcon slot="icon" size="16px" name="refresh"></TdsIcon>
        </TdsButton>
      </div>
    );
  }

  return (
    <div className={styles.executionLogContainer}>
      {loading ? (
        <Spinner />
      ) : (
        executionLog?.map((logItem, index) => {
          const { iconColor, borderColor, backgroundColor } = styleMapping[
            logItem.status
          ] || {
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
                background: backgroundColor,
              }}
            >
              <tds-icon
                name="info"
                size="22px"
                style={{ color: iconColor }}
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
