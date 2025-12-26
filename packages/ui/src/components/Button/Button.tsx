import type { MouseEventHandler } from "react";
import { useEffect } from "react";

import { useTracking } from "@repo/tracking";

import { ensureDesignTokensApplied } from "../../tokens/design-tokens";
import { cn } from "../../utils/cn";
import type { ButtonProps, ButtonVariant } from "./Button.types";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-colors-primary)] text-[var(--ui-colors-primary-foreground)] hover:bg-[var(--ui-colors-primary-hover)]",
  secondary:
    "bg-[var(--ui-colors-secondary)] text-[var(--ui-colors-secondary-foreground)] hover:bg-[var(--ui-colors-secondary-hover)] border border-[var(--ui-colors-border-subtle)]",
  danger:
    "bg-[var(--ui-colors-danger)] text-[var(--ui-colors-danger-foreground)] hover:bg-[var(--ui-colors-danger-hover)]"
};

export function Button({
  variant = "primary",
  state = "default",
  icon,
  disabled: disabledProp,
  className,
  onClick,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const { track } = useTracking();

  useEffect(() => {
    ensureDesignTokensApplied();
  }, []);

  const isDisabled = disabledProp === true || state === "disabled" || state === "loading";

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    onClick?.(e);
    if (e.defaultPrevented) return;

    void track({ component: "Button", variant, action: "click" });
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={state === "loading" ? true : undefined}
      onClick={handleClick}
      style={{
        fontWeight: "var(--ui-typography-font-weight-semibold)"
      }}
      className={cn(
        "inline-flex items-center justify-center",
        "gap-[var(--ui-spacing-2)]",
        "rounded-[var(--ui-border-radius-md)]",
        "px-[var(--ui-spacing-4)] py-[var(--ui-spacing-2)]",
        "font-[var(--ui-typography-font-family-sans)]",
        "text-[var(--ui-typography-font-size-sm)]",
        "leading-[var(--ui-typography-line-height-normal)]",
        "transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-colors-focus-ring)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-colors-background)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_STYLES[variant],
        className
      )}
      {...rest}
    >
      {state === "loading" ? (
        <Spinner />
      ) : (
        typeof icon !== "undefined" && <span className="inline-flex" aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin",
        "h-[var(--ui-spacing-4)] w-[var(--ui-spacing-4)]",
        "rounded-[var(--ui-border-radius-full)]",
        "border-2 border-current border-t-transparent"
      )}
    />
  );
}


