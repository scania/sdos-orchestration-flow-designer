import { useRouter } from "next/router";
import styles from "./card.module.scss";

const Card = ({ data, confirmFunction, confirmButtonLabel, confirmLabel }: any) => {
  const router = useRouter();
  return (
    <div className={styles.card}>
      <div className={styles.card__top}>
        <div className={styles.card__top__header}>
          <span>Private</span>
          <div className={styles.card__top__header__buttons}>
            <tds-button
              size="xs"
              id="dialog"
              text="Delete"
              variant="danger"
            ></tds-button>
            <tds-button
              size="xs"
              text="Open"
              variant="secondary"
              onClick={() => {
                router.push(`/ofd/id/${data.id}`);
              }}
            ></tds-button>
          </div>
        </div>
        <h3 className={styles.card__top__name}>{data.name}</h3>
        <p className={styles.card__top__description}>{data.description}</p>
      </div>
      <div className={styles.card__bottom}>
        <dl className={styles.card__data}>
          <dt className={styles.card__data__key}>State</dt>
          <dd>{"Saved"}</dd>
          <dt className={styles.card__data__key}>Last modified</dt>
          <dd>{data.updatedAt.slice(0, 10)}</dd>
        </dl>
      </div>
      {/* Dialog modal */}
      <tds-modal selector="#dialog" size="xs">
        <span slot="body">
          <h4 className="tds-modal-headline">{confirmLabel}</h4>
        </span>
        <span slot="actions">
          <tds-button
            size="md"
            text={confirmButtonLabel}
            type="submit"
            modeVariant="primary"
            onClick={() => confirmFunction(data.id)}
          />
        </span>
      </tds-modal>
    </div>
  );
};

export default Card;
