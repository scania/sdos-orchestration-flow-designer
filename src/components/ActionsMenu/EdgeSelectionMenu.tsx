import styles from "./actionsMenu.module.scss";

const EdgeSelectionMenu = ({ edges, onEdgeSelect, onClose }: any) => {
  return (
    <div className={styles.container}>
      <ul className={styles.container__list}>
        {edges.map((item: any) => {
          return (
            <li
              onClick={() => onEdgeSelect(item)}
              className={`${styles.container__list__item}`}
              value={item}
              key={item}
            >
              {item.split("/").pop()}
            </li>
          );
        })}
      </ul>
      <div onClick={() => onClose()} className={styles.container__close}>
        <tds-icon name={"cross"}/>
      </div>
    </div>
  );
};

export default EdgeSelectionMenu;
