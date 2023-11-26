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
  excludeKeys: string[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  classConfig,
  onSubmit,
  excludeKeys,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    onSubmit(data);
  };

  const renderInputField = (key: string, value: any) => {
    const isObject = typeof value === "object" && value !== null;

    if (isObject) {
      return Object.entries(value).map(([subKey, subValue]) => (
        <div key={`${key}.${subKey}`}>
          <label>{`${key} ${subKey}`}</label>
          <input
            //@ts-ignore
            defaultValue={subValue}
            {...register(`${key}.${subKey}`, {
              required: "This field is required",
            })}
          />
          {/* @ts-ignore */}
          {errors[key] && <span>{errors[key].message}</span>}
        </div>
      ));
    } else {
      return (
        <div key={key}>
          <label>{key}</label>
          <input
            defaultValue={value}
            {...register(key, { required: "This field is required" })}
          />
          {/* @ts-ignore */}
          {errors[key] && <span>{errors[key].message}</span>}
        </div>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {Object.entries(classConfig)
        .filter(([key]) => !excludeKeys.includes(key))
        .map(([key, value]) => renderInputField(key, value))}
      <input type="submit" />
    </form>
  );
};

export default DynamicForm;
