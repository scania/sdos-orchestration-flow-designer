import TabsPanels from "./TabPanels";
import dynamic from "next/dynamic";

type TabDataItem = {
  label: string;
  content: string;
};

type TabsProps = {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  tabData?: TabDataItem[];
};

const Tabs: React.FC<TabsProps> = ({ tabIndex, setTabIndex, tabData = [] }) => {
  return (
    <div>
      <h3>TAB INDEX</h3>
      <p>These tabs are using buttons and can be used to show/hide content.</p>
      {/* <div className="tds-u-mb3 tabs">
        <tds-folder-tabs tabIndex={tabIndex}>
          {tabData.map((tab, index) => (
            <tds-folder-tab key={index}>
              <button onClick={() => setTabIndex(index)}>{tab.label}</button>
            </tds-folder-tab>
          ))}
        </tds-folder-tabs>
      </div> */}
      <div className="tds-u-mb3 tabs">
        <tds-folder-tabs mode-variant="secondary">
          <tds-folder-tab>
            <button>First tab</button>
          </tds-folder-tab>
          <tds-folder-tab>
            <button>Second tab is much longer</button>
          </tds-folder-tab>
          <tds-folder-tab>
            <button>Third tab</button>
          </tds-folder-tab>
          <tds-folder-tab disabled>
            <button>Fourth tab</button>
          </tds-folder-tab>
        </tds-folder-tabs>
      </div>
      {/* <TabsPanels selectedTabIndex={tabIndex} /> */}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Tabs), { ssr: false });
// export default Tabs;
