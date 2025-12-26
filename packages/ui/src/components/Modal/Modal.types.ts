import type { ReactNode } from "react";

export type ModalSize = "small" | "medium" | "large";
export type ModalCloseReason = "x" | "overlay" | "esc" | "api";

export interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean, reason: ModalCloseReason) => void;
  size?: ModalSize;
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
}


