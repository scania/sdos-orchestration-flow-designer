import { useEffect, useState } from "react";
import JsonView from "@uiw/react-json-view";
import { isValidJson } from "@/helpers/helper";
import { darkTheme } from "@uiw/react-json-view/dark";

const ExecutionResult = ({ executionResult }: any) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkTheme(theme === "dark");
  }, []);

  const renderJsonView = (data: any) => (
    <JsonView
      value={data}
      indentWidth={4}
      style={isDarkTheme ? darkTheme : undefined}
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
