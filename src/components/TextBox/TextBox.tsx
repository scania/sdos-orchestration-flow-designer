import styles from "./textBox.module.scss";

const TextBox = ({ text, label }) => {
 return (
    <div className={styles.textBox}>
        <h6>{label}</h6>
        <div className={styles.textBox__resultContainer}>{text}</div>
    </div>
  )
}

export default TextBox