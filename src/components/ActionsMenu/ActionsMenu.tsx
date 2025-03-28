import styles from "./actionsMenu.module.scss";

const ActionsMenu = ({ onDeleteClick, onDisconnectClick }) => {
  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()} >
      <ul className={styles.container__list}>
        <li className={`${styles.container__disabled} ${styles.container__list__item}`}>Rename</li>
        <li className={`${styles.container__disabled} ${styles.container__list__item}`}>Duplicate</li>
        <li onClick={onDisconnectClick} className={`${styles.container__list__item}`}>Disconnect</li>
        {/* Prevent the node-click on deleting a node */}
        <li onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }} className={styles.container__list__item}>Delete</li>
      </ul>
    </div>
  )
};

export default ActionsMenu;
