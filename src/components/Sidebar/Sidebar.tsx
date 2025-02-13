import Accordion from "@/components/Accordion/Accordion";
import Tabs from "@/components/Tabs/Tabs";
import Tab from "@/components/Tabs/Tab";
import { ObjectProperties } from "@/utils/types";
import React, { useState, useEffect } from "react";
import styles from "./Sidebar.module.scss";
import ClassChip from "./ClassChip";

type SidebarProps = {
  showExtendedPanel: boolean;
  isLoading: boolean;
  setShowExtendedPanel: (value: boolean) => void;
  setupMode: boolean;
  graphName: any;
  selectedNode: Node,
  graphDescription: string;
  setSearchString: (value: string) => void;
  searchString: string;
  classes: any;
  secondaryProperties: ObjectProperties[];
  highlightedClassLabel: string;
  setHighlightedClassLabel: (className: string) => void;
  handleOnDrag: (e: React.DragEvent<HTMLDivElement>, className: string) => void;
  addToGraph: () => void;
  isEditable: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  setupMode,
  isLoading,
  graphName,
  selectedNode,
  graphDescription,
  classes,
  secondaryProperties = [],
  highlightedClassLabel,
  setHighlightedClassLabel,
  handleOnDrag,
  addToGraph,
  isEditable,
}) => {
  const [showExtendedPanel, setShowExtendedPanel] = useState(true);
  const [searchString, setSearchString] = useState("");
  const [activeClassesTab, setActiveClassesTab] = useState<string>("Actions");
  const [activeSecondaryClassesTab, setActiveSecondaryClassesTab] =
    useState<string>("required");

  const requiredClasses = secondaryProperties.filter(
    (item) => item.minCount > 0
  );
  const optionalClasses = secondaryProperties.filter(
    (item) => item.minCount === 0
  );

  const primaryClassTypes = [
    {
      label: 'Actions',
      identifier: 'Action'
    },
    {
      label: 'Parameters',
      identifier: 'Parameter'
    },
    {
      label: 'Scripts',
      identifier: 'Script'
    }
  ]

  function filteredPrimaryClasses(classes: any, category: string) {
    const filteredPrimaryClasses = classes.filter(
      (item: any) => item.category && item.category.includes(category)
    );

    if (searchString.length) {
      return filteredPrimaryClasses.filter(
        (item: any) =>
          item.className &&
          item.className.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    return filteredPrimaryClasses;
  }

  useEffect(() => {
    // Set the active tab based on the length of the optional/required classes
    if (optionalClasses.length && !requiredClasses.length) {
      setActiveSecondaryClassesTab("optional");
    } else {
      setActiveSecondaryClassesTab("required");
    }

    setHighlightedClassLabel("")
  }, [selectedNode]);

  const renderSecondaryClasses = () => {
    const classes =
      activeSecondaryClassesTab === "required"
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

          if (!classesForConnectorType.length) return null;

          let classNamesForConnectorType: string[] = [];

          classesForConnectorType.forEach((item) => {
            if (item.subClasses && item.subClasses.length > 0) {
              classNamesForConnectorType = classNamesForConnectorType.concat(
                item.subClasses
              );
            } else if (item.className) {
              classNamesForConnectorType.push(item.className);
            }
          });

          classNamesForConnectorType = Array.from(
            new Set(classNamesForConnectorType)
          );

          const filteredClassNames = classNamesForConnectorType.filter(
            (item) => {
              const className = item.split("/").pop() || "";
              return className
                .toLowerCase()
                .includes(searchString.toLowerCase());
            }
          );

          if (!filteredClassNames.length) return null;

          return (
            <Accordion
              key={connectorType}
              label={connectorType.split("/").pop() || ""}
              numberOfElements={filteredClassNames.length}
            >
              <div className={styles.classes}>
                {filteredClassNames.map((item, index) => {
                  const className = item.split("/").pop() || "";
                  return (
                    <ClassChip
                      highlightedClassLabel={highlightedClassLabel}
                      setHighlightedClassLabel={setHighlightedClassLabel}
                      className={className}
                      handleOnDrag={handleOnDrag}
                    />
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
          <h6 className={styles["tds-detail-06"]}>Private</h6>
          <tds-icon
            onClick={() => setShowExtendedPanel(!showExtendedPanel)}
            slot="icon"
            size="20px"
            class="pointer"
            name={showExtendedPanel ? "chevron_up" : "chevron_down"}
          ></tds-icon>
        </div>
        <h3 className={styles.sidebar__primaryHeading}>{graphName || ""}</h3>
        <p title={graphDescription} className={styles.sidebar__description}>
          {graphDescription}
        </p>
      </div>
      {showExtendedPanel && !setupMode ? (
        <>
          <tds-divider orientation="horizontal"></tds-divider>
          <div className={styles.sidebar__search}>
            <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
            <tds-text-field
              className={styles["tds-text-field"]}
              placeholder="Search..."
              value={searchString}
              onInput={(e: { currentTarget: { value: string } }) =>
                setSearchString(e.currentTarget.value)
              }
            />
          </div>
        

          <div className={styles.sidebar__tabs}>
          
            <Tabs
              activeTab={activeClassesTab}
              onTabChange={setActiveClassesTab}
            >
                {primaryClassTypes.map((tab, index) => (
                <Tab label={tab.label} tabKey={tab.label}>
                <div className={styles.sidebar__chips}>
                  {classes &&
                    filteredPrimaryClasses(classes, tab.identifier).map(
                      (item, index) => (
                        <ClassChip
                          key={index}
                          highlightedClassLabel={highlightedClassLabel}
                          setHighlightedClassLabel={setHighlightedClassLabel}
                          className={item.className}
                          handleOnDrag={handleOnDrag}
                        />
                      )
                    )}
                </div>
              </Tab>
              ))}
            </Tabs>
          </div>
          <div className={styles.sidebar__chips}>
            <div className={styles.classes__footer}>
              <tds-button
                type="button"
                variant="primary"
                size="sm"
                text="Add to graph"
                disabled={!highlightedClassLabel || !isEditable}
                onClick={addToGraph}
              >
                <tds-icon slot="icon" size="16px" name="plus"></tds-icon>
              </tds-button>
            </div>
          </div>
        </>
      ) : showExtendedPanel && setupMode ? (
        <>
          <tds-divider orientation="horizontal"></tds-divider>
          {(requiredClasses.length > 0 || optionalClasses.length > 0) && (
          <>
          <div className={styles.sidebar__search}>
            <h6 className={styles.sidebar__secondaryHeading}>Library</h6>
            <tds-text-field
              className={styles["tds-text-field"]}
              placeholder="Search..."
              value={searchString}
              onInput={(e: { currentTarget: { value: string } }) =>
                setSearchString(e.currentTarget.value)
              }
            />
          </div>
         
          <div className={styles.sidebar__tabs}>
            <Tabs
              activeTab={activeSecondaryClassesTab}
              onTabChange={setActiveSecondaryClassesTab}
            >
              <Tab
                label={`Required ${
                  requiredClasses.length ? `(${requiredClasses.length})` : ""
                }`}
                tabKey="required"
              >
                <div className={styles.sidebar__chips}>
                  {renderSecondaryClasses()}
                </div>
              </Tab>
              <Tab
                label={`Optional ${
                  optionalClasses.length ? `(${optionalClasses.length})` : ""
                }`}
                tabKey="optional"
              >
                <div className={styles.sidebar__chips}>
                  {renderSecondaryClasses()}
                </div>
              </Tab>
            </Tabs>
          </div>
          </>
           )}
          <div className={styles.sidebar__chips}>
            <div className={styles.classes__footer}>
              <tds-button
                type="button"
                variant="primary"
                size="sm"
                text="Add to graph"
                disabled={!highlightedClassLabel || !isEditable}
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
