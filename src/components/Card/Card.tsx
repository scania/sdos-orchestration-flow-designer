import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import HandleGraphMenu from "../ActionsMenu/HandleGraphMenu";
import { useRouter } from "next/router";
import styles from "./card.module.scss";
import { convertToLocalTime } from "@/lib/frontend/helper";
import axios from "axios";


const Card = ({
  data,
  baseUrl,
  fetchFlows
}: any) => {
  const router = useRouter();
  const { id, name, description, isDraft, updatedAt } = data;
  const dialogId = `dialog-${id}`;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const deleteGraph = async (id: string) => {
    try {
      await axios.delete(`${baseUrl}/api/flow/${data.id}`);
      await fetchFlows(); // Fetch the updated flows after deletion
    } catch (error) {
      console.error("Failed to delete graph:", error);
    }
  };

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
            <Popover
              isOpen={isPopoverOpen}
              onClickOutside={() => setIsPopoverOpen(false)}
              positions={["top", "bottom", "left", "right"]} // preferred positions by priority
              content={(
              <HandleGraphMenu 
              id={dialogId}
              onDeleteClick={() => deleteGraph(id)}
              />
              )}
            >
              <div onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
                <tds-icon name="meatballs" size="20px"></tds-icon>
              </div>
            </Popover>
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
          <dd>{convertToLocalTime(updatedAt)}</dd>
        </dl>
      </div>
    </div>
  );
};

export default Card;
