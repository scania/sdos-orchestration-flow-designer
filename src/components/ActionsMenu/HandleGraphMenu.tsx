import styles from "./actionsMenu.module.scss";

const HandleGraphMenu = ({onDeleteClick, onExecuteClick, id}) => {
  return (
  <div className={styles.container}>
    <ul className={styles.container__list}>
      <li onClick={onExecuteClick} className={`${styles.container__list__item}`}>Execute</li>
      <li onClick={onDeleteClick} className={styles.container__list__item}>Delete</li>
    </ul>
  </div>
)};

export default HandleGraphMenu;
