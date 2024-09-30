import styles from "./actionsMenu.module.scss";

const HandleGraphMenu = ({onDeleteClick}) => {
  return (
  <div className={styles.container}>
    <ul className={styles.container__list}>
      <li onClick={onDeleteClick} className={styles.container__list__item}>Delete</li>
    </ul>
  </div>
)};

export default HandleGraphMenu;
