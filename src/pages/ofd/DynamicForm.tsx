import React, { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from "./ofd.module.scss";
import { TdsTextarea } from "@scania/tegel-react";
import { DynamicFormProps, FormField, IFormInput } from "@/utils/types";
import { replaceSpecialChars } from "@/helpers/helper";
import FileConverter from "@/components/FileConverter";

const DynamicForm: React.FC<DynamicFormProps> = ({
  formData = { formFields: [] },
  onSubmit,
  excludeKeys = ["http://www.w3.org/2000/01/rdf-schema#label"],
  className,
  onClose,
  readOnly,
}) => {
  const { formFields } = formData;
  const formInitialValues = useMemo(() => {
    return formFields.reduce((acc, field) => {
      acc[replaceSpecialChars(field.name)] = field.value || ""; // Use field.value or "" if undefined
      return acc;
    }, {});
  }, [formFields]);

  const {
    register,
    handleSubmit,
    reset,
    formState,
    watch,
    setFocus,
    setValue,
  } = useForm<IFormInput>({
    defaultValues: formInitialValues,
  });
  const formValue = watch();
  const { errors } = formState;
  const [isLabelEditMode, setIsLabelEditMode] = useState(false);
  const labelValue = watch(
    replaceSpecialChars("http://www.w3.org/2000/01/rdf-schema#label")
  );

  const hasAttributes =
    formFields.filter(({ name }) => !excludeKeys.includes(name)).length > 0;

  useEffect(() => {
    reset(formInitialValues);
  }, [formFields, reset]);

  useEffect(() => {
    if (isLabelEditMode) {
      setFocus(
        replaceSpecialChars("http://www.w3.org/2000/01/rdf-schema#label")
      );
    }
  }, [isLabelEditMode]);

  const toggleEditMode = () => {
    if (readOnly) return;
    setIsLabelEditMode(!isLabelEditMode);
  };

  const handleConvertedResponse = (data: string) => {
    setValue(
      replaceSpecialChars(
        "https://kg.scania.com/it/iris_orchestration/context"
      ),
      data,
      { shouldDirty: true }
    );
  };

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    if (readOnly) return;
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

  const renderLabel = () => {
    if (readOnly) {
      return (
        <h5 className="tds-headline-05" style={{ display: "inline" }}>
          {labelValue || "No Name"}
        </h5>
      );
    }

    if (!labelValue && !isLabelEditMode) {
      return (
        <div onClick={toggleEditMode} style={{ cursor: "pointer" }}>
          <tds-icon
            name="error"
            size="16"
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
            className={styles["label-input"]}
            {...register(
              replaceSpecialChars("http://www.w3.org/2000/01/rdf-schema#label"),
              {
                required: "This field is required",
              }
            )}
            onBlur={toggleEditMode}
            onKeyDown={(e) => {
              e.key === "Enter" && toggleEditMode();
            }}
          />
          {labelValue && (
            <tds-icon
              name="tick"
              size="20"
              className={styles["confirm-icon"]}
              style={{
                cursor: "pointer",
              }}
              onClick={toggleEditMode}
            ></tds-icon>
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
    const { name, label, validation } = field;
    const fieldName = name.split("/");
    const validationRules = {
      required: validation.required ? "This field is required" : false,
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
            if (readOnly) return;
            setValue(nameWoSpecialChars, e.target.value, {
              shouldDirty: true,
            });
          }}
          value={value}
          disabled={readOnly}
        ></TdsTextarea>
      </section>
    );
  };

  return (
    <>
      <div className={styles["form-header"]}>
        <div className={styles.description}>
          <p className="tds-detail-06">{className}</p>
          <div className={styles["description__label"]}>{renderLabel()}</div>
        </div>
      </div>
      <article className={styles["form-body-section"]}>
        {hasAttributes && (
          <div className={styles["form-body-section__header"]}>
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <h5 className="tds-headline-05">Attributes</h5>
              {Object.keys(formState.errors).length > 0 && (
                <tds-badge size="sm"></tds-badge>
              )}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className={styles["form-body-section__form"]}>
            {formFields
              .filter(({ name }) => !excludeKeys.includes(name))
              .map((field) => renderInputField(field))}
          </div>
          {className === "JsonLdContext" && (
            <FileConverter onFileConverted={handleConvertedResponse} />
          )}
          <section className={styles["form__action-menu"]}>
            <tds-button
              type="submit"
              size="sm"
              text="Save"
              disabled={readOnly || !labelValue || !formState.isDirty}
            ></tds-button>
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
