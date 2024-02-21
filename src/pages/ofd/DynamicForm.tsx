import React, { useEffect } from "react";
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
  // Update form state when formData changes
  useEffect(() => {
    const defaultValues = formData.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {} as IFormInput);
    reset(defaultValues);
  }, [formData, reset]);

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    onSubmit(data);
  };

  const renderInputField = (field: FormField) => {
    const { name, type, label, validation } = field;
    // const isTextArea = type === "textarea";
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
          <h4 className={styles["description__name"]}>{label}</h4>
          <div className={styles["description__label"]}>
            <input type="text" className={styles["test"]} />{" "}
            <span className={styles["edit-icon"]}>
              <tds-icon
                name="edit"
                size="20"
                style={{ cursor: "pointer" }}
              ></tds-icon>
            </span>
          </div>
        </div>
        <tds-icon
          name="link"
          size="24"
          style={{ cursor: "pointer" }}
        ></tds-icon>
      </div>
      <article className="form" style={{ marginTop: "10px" }}>
        {/* <header class="header">
        <span class="header__label">Label:</span>
        <span class="header__name">Name</span>
    </header>
    <section class="body-section">
        <header class="body-section__header">Section Header</header>
        <form class="body-section__form">
            <input type="text" class="body-section__form-field" placeholder="Field 1">
            <input type="text" class="body-section__form-field" placeholder="Field 2">
            <!-- Add more form fields as needed -->
        </form>
    </section>
    <div class="button-container">
        <button class="button-container__button">Button 1</button>
        <button class="button-container__button">Button 2</button>
    </div> */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {formData
            .filter(({ name }) => !excludeKeys.includes(name))
            .map((field) => renderInputField(field))}
          <section
            style={{ display: "flex", gap: "5px", justifyContent: "right" }}
          >
            <tds-button
              type="button"
              size="sm"
              variant="secondary"
              text="Close"
              onClick={onClose}
            ></tds-button>
            <tds-button type="submit" size="sm" text="Apply"></tds-button>
          </section>
        </form>
      </article>
    </>
  );
};

export default React.memo(DynamicForm);
