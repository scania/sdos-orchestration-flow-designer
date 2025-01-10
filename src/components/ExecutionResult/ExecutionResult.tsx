import React from "react";
import JsonView from "@uiw/react-json-view";
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
      quotes={`"`}
    />
  );

  return (
    <span>
      {executionResult ? (
        typeof executionResult === "object" ? (
          renderJsonView(executionResult)
        ) : isValidJson(executionResult) ? (
          renderJsonView(executionResult)
        ) : (
          <p>{executionResult}</p>
        )
      ) : null}
    </span>
  );
};

export default ExecutionResult;
