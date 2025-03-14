import { useState } from "react";
import { Popover } from "react-tiny-popover";
import HandleGraphMenu from "../ActionsMenu/HandleGraphMenu";
import { useRouter } from "next/router";
import styles from "./card.module.scss";
import { convertToLocalTime } from "../../helpers/helper";

const Card = ({ data, deleteGraph, currentUserIsAuthor }: any) => {
  const router = useRouter();
  const { id, name, description, isDraft, updatedAt, user } = data;
  const { date, time } = convertToLocalTime(updatedAt);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.card__top}>
        <div className={styles.card__top__header}>
          <span>Private</span>
          <div className={styles.card__top__header__buttons}>
            <tds-button
              size="xs"
              text="Open"
              variant="secondary"
              onClick={() => {
                router.push(`/ofd/id/${id}`);
              }}
            ></tds-button>
            {currentUserIsAuthor &&
              <Popover
                isOpen={isPopoverOpen}
                padding={5}
                reposition={false}
                onClickOutside={() => setIsPopoverOpen(false)}
                positions={["top", "bottom", "left", "right"]}
                content={
                  <HandleGraphMenu
                    onDeleteClick={() => deleteGraph(id)}
                  />
                }
              >
                <div onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="pointer">
                  <tds-icon name="meatballs" size="20px"></tds-icon>
                </div>
              </Popover>
            }
          </div>
        </div>
        <h3 className={styles.card__top__name}>{name.split("/").pop()}</h3>
        <p className={styles.card__top__description}>{description}</p>
      </div>
      <div className={styles.card__bottom}>
        <dl className={styles.card__data}>
          <dt className={styles.card__data__key}>State</dt>
          <dd>{isDraft ? "Draft" : "Saved"}</dd>
          <dt className={styles.card__data__key}>Last modified</dt>
          <dd>
            <span>{date}</span> 
            <span className={styles.card__data__key__separator}>-</span>
            <span>{time}</span>
          </dd>
          <dt className={styles.card__data__key}>Author</dt>
          <dd>{user?.email || user?.name}</dd>
        </dl>
      </div>
    </div>
  );
};

export default Card;
