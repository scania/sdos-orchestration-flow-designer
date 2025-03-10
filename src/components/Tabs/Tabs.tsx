import React, { Children, ReactNode } from "react";
import styles from "./Tabs.module.scss";

interface TabsProps {
  activeTab: string;
  onTabChange?: (tabKey: string) => void;
  children: ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabs}>
        {Children.map(children, (child: any) => (
          <div
            key={child.props.tabKey}
            className={`${styles.tab} ${activeTab === child.props.tabKey ? styles.active : ""}`}
            onClick={() => onTabChange?.(child.props.tabKey)}
          >
            {child.props.label}
          </div>
        ))}
      </div>

      <div className={styles.tabContent}>
        {Children.map(children, (child: any) =>
          child.props.tabKey === activeTab ? child.props.children : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
