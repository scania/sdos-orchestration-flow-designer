import JsonView from "@uiw/react-json-view";
import styles from "./ExecutionResult.module.scss";
import { isValidJson } from "@/helpers/helper";

const ExecutionResult = ({ executionResult }: any) => {
  const renderJsonView = (executionResult: any) => (
    <JsonView
      value={executionResult}
      indentWidth={4}
      displayDataTypes={false}
      collapsed={false}
      displayObjectSize={true}
      enableClipboard={true}
    />
  );

  return (
    <div>
      <div>
        {executionResult ? (
          typeof executionResult === "object" ? (
            renderJsonView(executionResult)
          ) : isValidJson(executionResult) ? (
            renderJsonView(executionResult)
          ) : (
            <p>{executionResult}</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default ExecutionResult;
