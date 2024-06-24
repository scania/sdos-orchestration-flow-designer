import React, { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from "./ofd.module.scss";
import { TdsTextarea } from "@scania/tegel-react";
import { DynamicFormProps, FormField, IFormInput } from "@/utils/types";

// Helper functions for encoding and decoding
const replaceSpecialChars = (str: string) => str.replace(/[/.]/g, "_");
const restoreSpecialChars = (str: string) => str.replace(/_/g, "/");

const DynamicForm: React.FC<DynamicFormProps> = ({
  formData = { formFields: [] },
  onSubmit,
  excludeKeys = ["https://kg.scania.com/it/iris_orchestration/label"],
  label,
  onClose,
}) => {
  const { formFields } = formData;
  const formInitialValues = useMemo(() => {
    return formFields.reduce((acc, field) => {
      acc[replaceSpecialChars(field.name)] = field.value || ""; // Use field.value or "" if undefined
      return acc;
    }, {});
  }, [formFields]); // Dependency array ensures this only recalculates when formFields changes

  const {
    register,
    handleSubmit,
    reset,
    formState,
    watch,
    setFocus,
    setValue,
    control,
  } = useForm<IFormInput>({
    defaultValues: formInitialValues,
  });
  const formValue = watch();
  const { errors } = formState;
  const [isLabelEditMode, setIsLabelEditMode] = useState(false);
  const labelValue = watch(
    replaceSpecialChars("https://kg.scania.com/it/iris_orchestration/label")
  );

  const hasAttributes =
    formFields.filter(({ name }) => !excludeKeys.includes(name)).length > 0;

  useEffect(() => {
    reset(formInitialValues);
  }, [formFields, reset]);

  useEffect(() => {
    if (isLabelEditMode) {
      setFocus(
        replaceSpecialChars("https://kg.scania.com/it/iris_orchestration/label")
      );
    }
  }, [isLabelEditMode]);

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    const filledData = formFields.map((field: FormField) => {
      const { name } = field;
      if (data[replaceSpecialChars(name)]) {
        return { ...field, value: data[replaceSpecialChars(name)] };
      }
      return { ...field, value: "" };
    });

    onSubmit({ ...formData, formFields: filledData });
    reset(formValue);
  };

  const toggleEditMode = () => {
    setIsLabelEditMode(!isLabelEditMode);
  };

  const renderLabel = () => {
    if (!labelValue && !isLabelEditMode) {
      return (
        <div onClick={toggleEditMode} style={{ cursor: "pointer" }}>
          <tds-icon
            name="error"
            size="16px"
            style={{ color: "red", marginRight: "4px" }}
          ></tds-icon>
          <h5 className="tds-headline-05" style={{ display: "inline" }}>
            No Name
          </h5>
        </div>
      );
    }

    if (isLabelEditMode) {
      return (
        <>
          <input
            type="text"
            className={styles["test"]}
            {...register(
              replaceSpecialChars(
                "https://kg.scania.com/it/iris_orchestration/label"
              ),
              {
                required: "This field is required",
              }
            )}
            onBlur={toggleEditMode}
            onKeyDown={(e) => {
              e.key === "Enter" ? toggleEditMode() : null;
            }}
          />
          {labelValue ? (
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
          {labelValue}
        </h5>
        <span className={styles["edit-icon"]} style={{ marginLeft: "4px" }}>
          <tds-icon
            name="edit"
            size="20"
            style={{ cursor: "pointer", transform: "translateY(-5%)" }}
            onClick={toggleEditMode}
          ></tds-icon>
        </span>
      </>
    );
  };
  const renderInputField = (field: FormField) => {
    const { name, type, label, validation } = field;
    const fieldName = name.split("/");
    const validationRules = {
      required: validation.required ? "This field is required" : false,
      // minLength: validation.min
      //   ? {
      //       value: validation.min,
      //       message: validation.message || "Minimum length is not met",
      //     }
      //   : undefined,
      // maxLength: validation.max
      //   ? {
      //       value: validation.max,
      //       message: validation.message || "Maximum length exceeded",
      //     }
      //   : undefined,
      pattern: validation.pattern
        ? {
            value: new RegExp(validation.pattern),
            message: validation.message || "Pattern does not match",
          }
        : undefined,
    };
    const nameWoSpecialChars = replaceSpecialChars(name);
    register(nameWoSpecialChars, validationRules);
    const value = watch(nameWoSpecialChars);
    return (
      <section key={name} className="form-section">
        <TdsTextarea
          className="tds-text-field"
          label={fieldName[fieldName.length - 1]}
          label-position="outside"
          state={errors[nameWoSpecialChars] ? "error" : "default"}
          helper={errors[nameWoSpecialChars]?.message}
          placeholder={label}
          onInput={(e: any) => {
            setValue(nameWoSpecialChars, e.target.value, {
              shouldDirty: true,
            });
          }}
          value={value}
        ></TdsTextarea>
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
        {hasAttributes ? (
          <div className={styles["form-body-section__header"]}>
            <div
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              <h5 className="tds-headline-05">Attributes</h5>
              {Object.keys(formState.errors).length > 0 ? (
                <tds-badge
                  size="sm"
                  style={{ transform: "translateY(30%)" }}
                ></tds-badge>
              ) : (
                <></>
              )}
            </div>

            <tds-button
              type="button"
              variant="ghost"
              size="xs"
              text="Copy IRI Address"
            ></tds-button>
          </div>
        ) : (
          <></>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className={styles["form-body-section__form"]}>
            {formFields
              .filter(({ name }) => !excludeKeys.includes(name))
              .map((field) => renderInputField(field))}
          </div>
          <div className={styles["form-body-section__actions"]}>
            <section
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "left",
                marginTop: 34,
              }}
            >
              <tds-button
                type="submit"
                size="sm"
                text="Save"
                disabled={formState.isDirty ? false : true}
              ></tds-button>
              <tds-button
                type="button"
                size="sm"
                variant="secondary"
                text="Close"
                onClick={onClose}
              ></tds-button>
            </section>
          </div>
        </form>
      </article>
    </>
  );
};

export default React.memo(DynamicForm);
