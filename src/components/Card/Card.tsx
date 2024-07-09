import { useRouter } from "next/router";
import styles from "./card.module.scss";
import { convertToLocalTime } from "@/lib/frontend/helper";

const Card = ({
  data,
  confirmFunction,
  confirmButtonLabel,
  confirmLabel,
}: any) => {
  const router = useRouter();
  const { id, name, description, isDraft, updatedAt, isPrivate, user } = data;
  const dialogId = `dialog-${id}`;
  return (
    <div className={styles.card}>
      <div className={styles.card__top}>
        <div className={styles.card__top__header}>
          <span>{isPrivate ? "Private" : "Shared"}</span>
          <div className={styles.card__top__header__buttons}>
            <tds-button
              size="xs"
              id={dialogId}
              text="Delete"
              variant="danger"
            ></tds-button>
            <tds-button
              size="xs"
              text="Open"
              variant="secondary"
              onClick={() => {
                router.push(`/ofd/id/${id}`);
              }}
            ></tds-button>
          </div>
        </div>
        <h3 className={styles.card__top__name}>{name.split("/").pop()}</h3>
        <p className={styles.card__top__description}>{description}</p>
      </div>
      <div className={styles.card__bottom}>
        <dl className={styles.card__data}>
          <dt className={styles.card__data__key}>Created By</dt>
          <dd>{user.name}</dd>
          <dt className={styles.card__data__key}>State</dt>
          <dd>{isDraft ? "Draft" : "Saved"}</dd>
          <dt className={styles.card__data__key}>Last modified</dt>
          <dd>{convertToLocalTime(updatedAt)}</dd>
        </dl>
      </div>
      {/* Dialog modal */}
      <tds-modal selector={`#${dialogId}`} size="xs" style={{ zIndex: 9999 }}>
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
