import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from "./ofd.module.scss";

interface IFormInput {
  [key: string]: any;
}

interface FormField {
  name: string;
  type: string;
  label: string;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    required?: boolean;
  };
  value?: string;
}

interface DynamicFormProps {
  formData: FormField[];
  onSubmit: (data: IFormInput) => void;
  onClose: () => void;
  excludeKeys: string[];
  label: string;
}

const coreFields = [
  {
    name: "label",
    type: "text",
    label: "Label",
    validation: {
      required: true,
      minLength: 1,
      maxLength: 50,
      message: "Label must be a string with 1 to 50 characters",
    },
  },
];

const DynamicForm: React.FC<DynamicFormProps> = ({
  formData = coreFields,
  onSubmit,
  excludeKeys,
  label,
  onClose,
}) => {
  const { register, handleSubmit, reset, formState } = useForm<IFormInput>();
  const { errors } = formState;
  const [classLabel, setClassLabel] = useState("");
  const [islabelEditMode, setIsLabelEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const defaultValues = formData.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {} as IFormInput);
    reset(defaultValues);
  }, [formData, reset]);

  useEffect(() => {
    if (islabelEditMode) {
      inputRef.current?.focus();
    }
  }, [islabelEditMode]);

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data, "data");

    onSubmit(data);
  };

  const toggleEditMode = () => {
    console.log("button clicked");

    setIsLabelEditMode(!islabelEditMode);
  };

  const onClassLabelChange = (e: any) => {
    setClassLabel(e.target.value);
  };

  const renderLabel = () => {
    if (!classLabel && !islabelEditMode) {
      return (
        <div onClick={toggleEditMode} style={{ cursor: "pointer" }}>
          <tds-icon
            name="error"
            size="16px"
            style={{ color: "red", marginRight: "4px" }}
          ></tds-icon>
          <h5 className="tds-headline-05" style={{ display: "inline" }}>
            New Name
          </h5>
        </div>
      );
    }

    if (islabelEditMode) {
      return (
        <>
          <input
            ref={inputRef}
            type="text"
            className={styles["test"]}
            value={classLabel}
            onChange={onClassLabelChange}
            onBlur={toggleEditMode}
            onKeyDown={(e) => {
              e.key === "Enter" ? toggleEditMode() : null;
            }}
          />
          {classLabel ? (
            <tds-icon
              name="tick"
              size="20"
              className={styles["confirm-icon"]}
              style={{
                cursor: "pointer",
              }}
              onClick={toggleEditMode}
            ></tds-icon>
          ) : (
            <></>
          )}
        </>
      );
    }
    return (
      <>
        <h5 className="tds-headline-05" style={{ display: "inline" }}>
          {classLabel}
        </h5>
        <span className={styles["edit-icon"]}>
          <tds-icon
            name="edit"
            size="20"
            style={{ cursor: "pointer" }}
            onClick={toggleEditMode}
          ></tds-icon>{" "}
        </span>
      </>
    );
  };
  const renderInputField = (field: FormField) => {
    const { name, type, label, validation } = field;
    const validationRules = {
      required: validation.required ? "This field is required" : false,
      minLength: validation.min
        ? {
            value: validation.min,
            message: validation.message || "Minimum length is not met",
          }
        : undefined,
      maxLength: validation.max
        ? {
            value: validation.max,
            message: validation.message || "Maximum length exceeded",
          }
        : undefined,
      pattern: validation.pattern
        ? {
            value: new RegExp(validation.pattern),
            message: validation.message || "Pattern does not match",
          }
        : undefined,
    };
    const fieldName = name.split("/");

    return (
      <section key={name} className="form-section">
        <tds-textarea
          className="tds-text-field"
          label={fieldName[fieldName.length - 1]}
          label-position="outside"
          state={errors[name] ? "error" : "default"}
          helper={errors[name]?.message}
          placeholder={label}
          {...register(name, validationRules)}
        />
      </section>
    );
  };

  return (
    <>
      <div className={styles["form-header"]}>
        <div className={styles.description}>
          <p className="tds-detail-06">{label}</p>
          <div className={styles["description__label"]}>{renderLabel()}</div>
        </div>
        <tds-icon
          name="link_broken"
          size="24"
          style={{ cursor: "pointer" }}
          svg-title="Not saved in library"
        ></tds-icon>
      </div>
      <article className={styles["form-body-section"]}>
        <div className={styles["form-body-section__header"]}>
          <div
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
            <h5 className="tds-headline-05">Attributes</h5>
            <tds-badge
              size="sm"
              style={{ transform: "translateY(30%)" }}
            ></tds-badge>
          </div>
          <tds-button
            type="button"
            variant="ghost"
            size="xs"
            text="Copy IRI Address"
          ></tds-button>
        </div>
        <div className={styles["form-body-section__form"]}></div>
        <div className={styles["form-body-section__actions"]}></div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {formData
            .filter(({ name }) => !excludeKeys.includes(name))
            .map((field) => renderInputField(field))}
          <section
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "left",
              marginTop: 34,
            }}
          >
            <tds-button type="submit" size="sm" text="Save"></tds-button>
            <tds-button
              type="button"
              size="sm"
              variant="secondary"
              text="Close"
              onClick={onClose}
            ></tds-button>
          </section>
        </form>
      </article>
    </>
  );
};

export default React.memo(DynamicForm);
