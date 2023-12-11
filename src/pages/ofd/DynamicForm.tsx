import React, { useEffect, useState } from "react";
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

const textAreaKeys = ["iris:constructSparql"];

const DynamicForm: React.FC<DynamicFormProps> = ({
  classConfig = {},
  onSubmit,
  excludeKeys,
  label,
  onClose,
}) => {
  const { register, handleSubmit, reset, formState } = useForm<IFormInput>();
  const { errors } = formState;

  //   Update form state when classConfig changes
  useEffect(() => {
    reset(classConfig);
  }, [classConfig, reset]);

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    onSubmit(data);
  };

  const renderInputField = (key: string, value: any) => {
    const isObject = typeof value === "object" && value !== null;

    if (isObject) {
      return Object.entries(value).map(([subKey, subValue]) => (
        <section key={`${key}.${subKey}`} className="form-section">
          <tds-text-field
            className="tds-text-field"
            state={errors[key] ? "error" : "default"}
            label-position="outside"
            label={`${key} ${subKey}`}
            // @ts-ignore
            helper={errors[key] ? errors[key][subKey].message : ""}
            {...register(`${key}.${subKey}`, {
              required: "This field is required",
              minLength: { value: 2, message: "Minimum length is 2" },
              maxLength: { value: 50, message: "Maximum length is 50" },
            })}
          />
        </section>
      ));
    } else {
      return (
        <section key={key} className="form-section">
          {textAreaKeys.includes(key) ? (
            <tds-textarea
              className="tds-text-field"
              label={key}
              label-position="outside"
              state={errors[key] ? "error" : "default"}
              // @ts-ignore
              helper={errors[key] ? errors[key].message : ""}
              {...register(key, {
                required: "This field is required",
                minLength: { value: 2, message: "Minimum length is 2" },
              })}
            />
          ) : (
            <tds-text-field
              className="tds-text-field"
              label={key}
              label-position="outside"
              state={errors[key] ? "error" : "default"}
              // @ts-ignore
              helper={errors[key] ? errors[key].message : ""}
              {...register(key, {
                required: "This field is required",
                minLength: { value: 2, message: "Minimum length is 2" },
                maxLength: { value: 50, message: "Maximum length is 50" },
              })}
            />
          )}
        </section>
      );
    }
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
