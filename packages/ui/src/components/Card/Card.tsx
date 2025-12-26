import type { KeyboardEventHandler, MouseEventHandler } from "react";
import { useEffect } from "react";

import { useTracking } from "@repo/tracking";

import { ensureDesignTokensApplied } from "../../tokens/design-tokens";
import { cn } from "../../utils/cn";
import type { CardBorderStyle, CardProps } from "./Card.types";

const BORDER_STYLES: Record<CardBorderStyle, string> = {
  none: "border border-transparent",
  subtle: "border border-[var(--ui-colors-border-subtle)]",
  strong: "border border-[var(--ui-colors-border-strong)]"
};

export function Card({
  border = "subtle",
  header,
  children,
  footer,
  imageSrc,
  imageAlt,
  onClick,
  className,
  ...rest
}: CardProps) {
  const { track } = useTracking();

  useEffect(() => {
    ensureDesignTokensApplied();
  }, []);

  const isClickable = typeof onClick === "function";

  const handleClick: MouseEventHandler<HTMLDivElement> = (_e) => {
    if (!isClickable) return;
    onClick();
    void track({ component: "Card", variant: border, action: "click" });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!isClickable) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onClick();
    void track({ component: "Card", variant: border, action: "click" });
  };

  return (
    <div
      className={cn(
        "rounded-[var(--ui-border-radius-lg)]",
        "bg-[var(--ui-colors-surface)]",
        "text-[var(--ui-colors-foreground)]",
        "shadow-[var(--ui-shadows-sm)]",
        BORDER_STYLES[border],
        "p-[var(--ui-spacing-4)]",
        isClickable &&
          cn(
            "cursor-pointer",
            "hover:shadow-[var(--ui-shadows-md)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-colors-focus-ring)]"
          ),
        className
      )}
      style={{ fontFamily: "var(--ui-typography-font-family-sans)" }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {typeof imageSrc === "string" && (
        <img
          src={imageSrc}
          alt={typeof imageAlt === "string" ? imageAlt : ""}
          className={cn(
            "w-full",
            "rounded-[var(--ui-border-radius-md)]",
            "mb-[var(--ui-spacing-3)]",
            "object-cover"
          )}
        />
      )}

      {header && (
        <div
          className={cn(
            "mb-[var(--ui-spacing-3)]",
            "text-[var(--ui-typography-font-size-lg)]",
            "leading-[var(--ui-typography-line-height-tight)]"
          )}
          style={{ fontWeight: "var(--ui-typography-font-weight-semibold)" }}
        >
          {header}
        </div>
      )}

      {children && (
        <div
          className={cn("text-[var(--ui-typography-font-size-base)]", "leading-[var(--ui-typography-line-height-normal)]")}
          style={{ fontWeight: "var(--ui-typography-font-weight-normal)" }}
        >
          {children}
        </div>
      )}

      {footer && (
        <div className={cn("mt-[var(--ui-spacing-4)]", "pt-[var(--ui-spacing-3)]")}>{footer}</div>
      )}
    </div>
  );
}


