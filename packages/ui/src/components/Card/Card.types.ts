import type { HTMLAttributes, ReactNode } from "react";

export type CardBorderStyle = "none" | "subtle" | "strong";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  border?: CardBorderStyle;
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  onClick?: () => void;
}


