interface TabsPanelsProps {
  selectedTabIndex: number;
}

const TabsPanels = ({ selectedTabIndex }: TabsPanelsProps) => {
  return (
    <tds-block key={`tab-panel-${selectedTabIndex}`}>
      <h5>Tab {selectedTabIndex}</h5>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi aut sit,
        accusantium, voluptatum dicta nisi laudantium sunt eum, velit porro quas
        dignissimos obcaecati. Veritatis exercitationem possimus quos animi
        atque maxime fuga, voluptatum nostrum ab ea voluptate dignissimos non
        error nobis beatae fugiat temporibus cum at molestias et perferendis
        iste! Hic?
      </p>
    </tds-block>
  );
};

export default TabsPanels;
