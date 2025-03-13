import styles from "./ActionToolbar.module.scss";
import { useRouter } from "next/router";
import GraphOptions from "../GraphOptions/GraphOptions";
import Tooltip from "../Tooltip/Tooltip";

type Graph = {
  name?: string;
  description?: string;
  isDraft?: boolean;
  author?: object;
};

type AccordionProps = {
  handleSaveClick?: (type: "draft" | "save") => void;
  handleExecute?: () => void;
  isDraft?: boolean;
  isEditable?: boolean;
  toolbar?: boolean;
  graph?: Graph;
};

const ActionToolbar: React.FC<AccordionProps> = ({
  toolbar = false,
  graph = { name: "", description: "", isDraft: false },
  handleSaveClick,
  handleExecute,
  isEditable = false,
}) => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className="pointer" onClick={router.back}>
        <span>Back</span>
        <tds-icon
          slot="icon"
          style={{ marginLeft: "8px" }}
          size="14px"
          name="back"
        ></tds-icon>
      </div>
      {toolbar && (
        <div className={styles.container__actionsContainer}>
          <GraphOptions
            selector="#graph-options"
            graphDescription={graph?.description || ""}
            graphName={graph?.name || ""}
            author={graph?.author}
          />
          <span id="graph-options" className="pointer">
            Options
          </span>
          <span
            id="execute-graph"
            className={`${
              graph?.isDraft
                ? styles.container__actionsContainer__disabled
                : "pointer"
            }`}
            onClick={() => handleExecute?.()}
          >
            Execute
          </span>
          {isEditable ? (
            <>
              <Tooltip 
                content={"Save a draft of your graph without fullfilling all requirments. You can edit and finalize it later."} 
                direction="bottom">
                <span
                  className="pointer"
                  onClick={() => handleSaveClick?.("draft")}
                >
                  Save Draft
                </span>
              </Tooltip>
              <Tooltip 
                content={"Save your graph. Ensures all validations are met before saving."} 
                direction="bottom">
              <span
                className="pointer"
                onClick={() => handleSaveClick?.("save")}
              >
                Save
              </span>
              </Tooltip>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ActionToolbar;
