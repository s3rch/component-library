import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonState = "default" | "loading" | "disabled";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  variant?: ButtonVariant;
  state?: ButtonState;
  icon?: ReactNode;
  disabled?: boolean;
}


