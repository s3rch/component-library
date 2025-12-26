import type { InputHTMLAttributes } from "react";

export type InputType = "text" | "email" | "password";
export type InputValidationState = "default" | "error" | "success";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType;
  validation?: InputValidationState;
  label?: string;
}


