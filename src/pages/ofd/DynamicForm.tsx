import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface IClassConfig {
  [key: string]: any;
}

interface IFormInput {
  [key: string]: any;
}

interface DynamicFormProps {
  classConfig: IClassConfig;
  onSubmit: (data: IFormInput) => void;
  onClose: () => void;
  excludeKeys: string[];
  label: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  classConfig,
  onSubmit,
  excludeKeys,
  label,
  onClose,
}) => {
  const { register, handleSubmit, formState } = useForm<IFormInput>();
  const { errors } = formState;

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    onSubmit(data);
  };

  const renderInputField = (key: string, value: any) => {
    const isObject = typeof value === "object" && value !== null;

    if (isObject) {
      return Object.entries(value).map(([subKey, subValue]) => (
        <div key={`${key}.${subKey}`} className="form-section">
          <label>{`${key} ${subKey}`}</label>
          <tds-text-field
            className="tds-text-field"
            defaultValue={subValue}
            value={subValue}
            {...register(`${key}.${subKey}`, {
              required: "This field is required",
            })}
          />
          {errors[key] && (
            <span className="error-message">{errors[key].message}</span>
          )}
        </div>
      ));
    } else {
      return (
        <div key={key} className="form-section">
          <h4>Edit Class</h4>
          class{" "}
          <tds-chip type="button" size="sm" draggable key={key}>
            <span slot="label" style={{ fontWeight: 700, fontSize: "10px" }}>
              {label}
            </span>
          </tds-chip>
          <tds-text-field
            className="tds-text-field"
            label={key}
            label-position="outside"
            value={value}
            default-value={value}
            {...register(key, { required: "This field is required" })}
          />
          {errors[key] && (
            <span className="error-message">{errors[key].message}</span>
          )}
        </div>
      );
    }
  };

  return (
    <article className="form">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {Object.entries(classConfig)
          .filter(([key]) => !excludeKeys.includes(key))
          .map(([key, value]) => renderInputField(key, value))}
        <section
          style={{ display: "flex", gap: "5px", justifyContent: "right" }}
        >
          <tds-button
            type="button"
            size="sm"
            variant="secondary"
            text="Close"
            onClick={() => {
              onClose();
            }}
          ></tds-button>
          <tds-button type="submit" size="sm" text="Apply"></tds-button>
        </section>
      </form>
    </article>
  );
};

export default React.memo(DynamicForm);
