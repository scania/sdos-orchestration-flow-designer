import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

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
      <h4 style={{ marginBottom: "5px" }}>Edit Class</h4>
      <tds-chip type="button" size="sm">
        <span slot="label" style={{ fontWeight: 700, fontSize: "10px" }}>
          {label}
        </span>
      </tds-chip>
      <article className="form" style={{ marginTop: "10px" }}>
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
