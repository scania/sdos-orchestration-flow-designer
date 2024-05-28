import { useRouter } from "next/router";
import styles from "./card.module.scss";

const Card = ({ data }) => {
  const router = useRouter();
  return (
    <div className={styles.card}>
      <div className={styles.card__top}>
        <div className={styles.card__header}>
          <span>Private</span>
          <tds-button
            size="xs"
            text="Open"
            variant="secondary"
            onClick={() => {
              router.push(`/ofd/id/${data.id}`);
            }}
          ></tds-button>
        </div>
        <h3>{data.name}</h3>
        <p className={styles.card__header__description}>{data.description}</p>
      </div>
      <div className={styles.card__bottom}>
        <dl className={styles.card__data}>
          <dt className={styles.card__data__key}>State</dt>
          <dd>{"saved"}</dd>
          <dt className={styles.card__data__key}>Last modified</dt>
          <dd>{data.updatedAt.slice(0, 10)}</dd>
          {/* <dt className={styles.card__data__key}>Creator:</dt>
          <dd>{data.createdBy}</dd> */}
        </dl>
      </div>
    </div>
  );
};

export default Card;
