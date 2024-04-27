import Accordion from "@/components/Accordion/Accordion";
import Panel from "@/components/Tabs/Panel";
import Tabs from "@/components/Tabs/Tabs";
import React from "react";
import styles from "./ofd.module.scss";
import { ObjectProperties } from "@/utils/types";

type SidebarProps = {
  showExtendedPanel: boolean;
  setShowExtendedPanel: (value: boolean) => void;
  setupMode: boolean;
  graphName: any;
  graphDescription: string;
  setSearchString: (value: string) => void;
  selectedPrimaryCategory: string;
  setSelectedPrimaryCategory: (value: string) => void;
  selectedSecondaryCategory: string;
  setSelectedSecondaryCategory: (value: string) => void;
  renderClasses: () => JSX.Element;
  secondaryProperties: ObjectProperties[];
  highlightedClassLabel: string;
  setHighlightedClassLabel: (className: string) => void;
  handleOnDrag: (e: React.DragEvent<HTMLDivElement>, className: string) => void;
  addToGraph: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  showExtendedPanel,
  setShowExtendedPanel,
  setupMode,
  graphName,
  graphDescription,
  setSearchString,
  selectedPrimaryCategory,
  selectedSecondaryCategory,
  setSelectedPrimaryCategory,
  setSelectedSecondaryCategory,
  renderClasses,
  secondaryProperties,
  highlightedClassLabel,
  setHighlightedClassLabel,
  handleOnDrag,
  addToGraph,
}) => {
  const requiredClasses = secondaryProperties.filter(
    (item) => item.minCount > 0
  );
  const optionalClasses = secondaryProperties.filter(
    (item) => item.minCount === 0
  );

  const renderSecondaryClasses = () => {
    const classes =
      selectedSecondaryCategory === "required"
        ? requiredClasses
        : optionalClasses;

    const connectorTypes = Array.from(
      new Set(classes.map((item) => item.path))
    );
    return (
      <>
        {connectorTypes.map((connectorType) => {
          const classesForConnectorType = classes.filter(
            (item) => item.path === connectorType
          );
          if (!classesForConnectorType.length) return;
          const classNamesForConnectorType = classesForConnectorType[0]
            .subClasses.length
            ? classesForConnectorType[0].subClasses
            : [classesForConnectorType[0].className];

          console.log(classesForConnectorType, "classesForConnectorType");

          return (
            <Accordion
              label={connectorType.split("/").pop() || ""}
              onButtonClick={() => alert("hey")}
              // button={true}
              // buttonText={"New"}
              numberOfElements={classNamesForConnectorType.length}
            >
              <div className={styles.classes}>
                {classNamesForConnectorType.map((item, index) => {
                  const className = item.split("/").pop() || "";
                  return (
                    <div
                      draggable
                      key={index}
                      onClick={() => setHighlightedClassLabel(className)}
                      onDragStart={(e) => handleOnDrag(e, className)}
                      className={`${styles.classes__class} ${
                        highlightedClassLabel === className
                          ? styles.active__chip
                          : styles.inactive__chip
                      }`}
                    >
                      <div className={styles.classes__class__content}>
                        <div
                          className={`${styles.classes__class__content__icon} ${
                            highlightedClassLabel === className
                              ? styles.active__container
                              : ""
                          }`}
                        >
                          <tds-icon name="double_kebab" size="16px"></tds-icon>
                        </div>
                        <span className={styles.classes__class__content__label}>
                          {className}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          );
        })}
      </>
    );
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__header}>
        <div className={styles.sidebar__type_and_toggle}>
          <h6 className={styles["tds-detail-06"]}>Private</h6>{" "}
          {/* This still needs replacing with dynamic content */}
          <tds-icon
            onClick={() => setShowExtendedPanel(!showExtendedPanel)}
            slot="icon"
            size="20px"
            name={showExtendedPanel ? "chevron_up" : "chevron_down"}
          ></tds-icon>
        </div>
        <h3 className={styles.sidebar__primaryHeading}>{graphName || ""}</h3>
        <p className={styles.sidebar__description}>{graphDescription}</p>
      </div>
      {showExtendedPanel && !setupMode ? (
        <>
          <tds-divider orientation="horizontal"></tds-divider>
          <div className={styles.sidebar__search}>
            <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
            <tds-text-field
              className={styles["tds-text-field"]}
              placeholder="Search..."
              onInput={(e: { currentTarget: { value: string } }) =>
                setSearchString(e.currentTarget.value)
              }
            />
          </div>
          <div className={styles.sidebar__tabs}>
            <Tabs
              selected={0}
              onParentClick={(value: string) =>
                setSelectedPrimaryCategory(value)
              }
            >
              <Panel title="Actions" value="Action"></Panel>
              <Panel title="Parameters" value="Parameter"></Panel>
              <Panel title="Scripts" value="Script"></Panel>
            </Tabs>
          </div>
          <div className={styles.sidebar__chips}>{renderClasses()}</div>
        </>
      ) : showExtendedPanel && setupMode ? (
        <>
          <tds-divider orientation="horizontal"></tds-divider>
          <div className={styles.sidebar__search}>
            <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
            <tds-text-field
              className={styles["tds-text-field"]}
              placeholder="Search..."
              onInput={(e: { currentTarget: { value: string } }) =>
                setSearchString(e.currentTarget.value)
              }
            />
          </div>
          <div className={styles.sidebar__tabs}>
            <Tabs
              selected={0}
              onParentClick={(value: string) =>
                setSelectedSecondaryCategory(value)
              }
            >
              <Panel
                title={`Required ${requiredClasses.length}`}
                value="required"
              ></Panel>
              <Panel
                title={`Optional ${optionalClasses.length}`}
                value="optional"
              ></Panel>
            </Tabs>
          </div>
          <div className={styles.sidebar__chips}>
            {renderSecondaryClasses()}
            <div className={styles.classes__footer}>
              <tds-button
                type="button"
                variant="primary"
                size="sm"
                text="Add to graph"
                disabled={!highlightedClassLabel}
                onClick={addToGraph}
              >
                <tds-icon slot="icon" size="16px" name="plus"></tds-icon>
              </tds-button>
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
};

export default Sidebar;
