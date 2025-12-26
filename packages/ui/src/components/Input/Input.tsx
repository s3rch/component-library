import type { FocusEventHandler } from "react";
import { useEffect, useId, useMemo } from "react";

import { useTracking } from "@repo/tracking";

import { ensureDesignTokensApplied } from "../../tokens/design-tokens";
import { cn } from "../../utils/cn";
import type { InputProps, InputType, InputValidationState } from "./Input.types";

const VALIDATION_STYLES: Record<InputValidationState, string> = {
  default:
    "border-[var(--ui-colors-border-subtle)] focus-visible:ring-[var(--ui-colors-focus-ring)] focus-visible:border-[var(--ui-colors-focus-ring)]",
  error:
    "border-[var(--ui-colors-danger)] focus-visible:ring-[var(--ui-colors-danger)] focus-visible:border-[var(--ui-colors-danger)]",
  success:
    "border-[var(--ui-colors-success)] focus-visible:ring-[var(--ui-colors-success)] focus-visible:border-[var(--ui-colors-success)]"
};

export function Input({
  type = "text",
  validation = "default",
  label,
  id: idProp,
  className,
  onFocus,
  onBlur,
  disabled,
  ...rest
}: InputProps) {
  const { track } = useTracking();

  useEffect(() => {
    ensureDesignTokensApplied();
  }, []);

  const reactId = useId();
  const id = idProp ?? reactId;

  const variant = useMemo(() => buildInputVariant(type, validation), [type, validation]);

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    onFocus?.(e);
    if (e.defaultPrevented) return;
    void track({ component: "Input", variant, action: "focus" });
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    onBlur?.(e);
    if (e.defaultPrevented) return;
    void track({ component: "Input", variant, action: "blur" });
  };

  return (
    <div className={cn("flex flex-col", "gap-[var(--ui-spacing-1)]", className)}>
      {typeof label === "string" && (
        <label
          htmlFor={id}
          className={cn(
            "text-[var(--ui-typography-font-size-sm)]",
            "leading-[var(--ui-typography-line-height-normal)]",
            "text-[var(--ui-colors-foreground)]"
          )}
          style={{ fontWeight: "var(--ui-typography-font-weight-medium)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "w-full",
          "rounded-[var(--ui-border-radius-md)]",
          "bg-[var(--ui-colors-surface)]",
          "px-[var(--ui-spacing-3)] py-[var(--ui-spacing-2)]",
          "text-[var(--ui-typography-font-size-base)]",
          "leading-[var(--ui-typography-line-height-normal)]",
          "text-[var(--ui-colors-foreground)]",
          "placeholder:text-[var(--ui-colors-muted)]",
          "border",
          "focus:outline-none focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VALIDATION_STYLES[validation]
        )}
        style={{
          fontFamily: "var(--ui-typography-font-family-sans)",
          fontWeight: "var(--ui-typography-font-weight-normal)"
        }}
        {...rest}
      />
    </div>
  );
}

function buildInputVariant(type: InputType, validation: InputValidationState): string {
  return `type:${type}|validation:${validation}`;
}


