import styles from "./actionsMenu.module.scss";

const EdgeSelectionMenu = ({ edges, onEdgeSelect }: any) => {
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
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default EdgeSelectionMenu;
