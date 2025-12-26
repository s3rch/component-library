import type { MouseEventHandler } from "react";
import { useCallback, useEffect, useId, useRef } from "react";

import { useTracking } from "@repo/tracking";

import { ensureDesignTokensApplied } from "../../tokens/design-tokens";
import { cn } from "../../utils/cn";
import type { ModalCloseReason, ModalProps, ModalSize } from "./Modal.types";

const SIZE_STYLES: Record<ModalSize, string> = {
  small: "max-w-[var(--ui-sizes-modal-small)]",
  medium: "max-w-[var(--ui-sizes-modal-medium)]",
  large: "max-w-[var(--ui-sizes-modal-large)]"
};

export function Modal({
  open,
  onOpenChange,
  size = "medium",
  header,
  children,
  footer,
  showCloseButton = true,
  className
}: ModalProps) {
  const { track } = useTracking();

  const headerId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  const openRef = useRef<boolean>(open);
  openRef.current = open;

  const pendingCloseReasonRef = useRef<ModalCloseReason | null>(null);
  const prevOpenRef = useRef<boolean>(open);

  const requestClose = useCallback(
    (reason: ModalCloseReason) => {
      pendingCloseReasonRef.current = reason;
      onOpenChange?.(false, reason);

      // If parent doesn't close the modal, avoid keeping stale reason forever.
      globalThis.setTimeout(() => {
        if (openRef.current) pendingCloseReasonRef.current = null;
      }, 0);
    },
    [onOpenChange]
  );

  useEffect(() => {
    ensureDesignTokensApplied();
  }, []);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;

    if (!wasOpen && open) {
      pendingCloseReasonRef.current = null;
      previouslyFocusedRef.current = typeof document === "undefined" ? null : document.activeElement;

      void track({ component: "Modal", variant: size, action: "open" });
      dialogRef.current?.focus();
    }

    if (wasOpen && !open) {
      const reason: ModalCloseReason = pendingCloseReasonRef.current ?? "api";
      pendingCloseReasonRef.current = null;

      void track({ component: "Modal", variant: size, action: "close", metadata: { reason } });

      const prev = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (prev instanceof HTMLElement) {
        prev.focus();
      }
    }

    prevOpenRef.current = open;
  }, [open, size, track]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      requestClose("esc");
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, requestClose]);

  const onOverlayMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) return;
    requestClose("overlay");
  };

  const onXClick = () => requestClose("x");

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-[var(--ui-colors-overlay)]",
        "p-[var(--ui-spacing-4)]"
      )}
      onMouseDown={onOverlayMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={header ? headerId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full",
          SIZE_STYLES[size],
          "rounded-[var(--ui-border-radius-lg)]",
          "bg-[var(--ui-colors-surface)]",
          "text-[var(--ui-colors-foreground)]",
          "shadow-[var(--ui-shadows-md)]",
          "border border-[var(--ui-colors-border-subtle)]",
          "outline-none",
          className
        )}
        style={{ fontFamily: "var(--ui-typography-font-family-sans)" }}
      >
        {showCloseButton && (
          <button
            type="button"
            aria-label="Close modal"
            onClick={onXClick}
            className={cn(
              "absolute right-[var(--ui-spacing-3)] top-[var(--ui-spacing-3)]",
              "inline-flex items-center justify-center",
              "h-[var(--ui-spacing-8)] w-[var(--ui-spacing-8)]",
              "rounded-[var(--ui-border-radius-md)]",
              "text-[var(--ui-colors-foreground)]",
              "hover:bg-[var(--ui-colors-secondary)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-colors-focus-ring)]"
            )}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        {header && (
          <div
            id={headerId}
            className={cn(
              "px-[var(--ui-spacing-4)] py-[var(--ui-spacing-3)]",
              "border-b border-[var(--ui-colors-border-subtle)]",
              "text-[var(--ui-typography-font-size-lg)]",
              "leading-[var(--ui-typography-line-height-tight)]"
            )}
            style={{ fontWeight: "var(--ui-typography-font-weight-semibold)" }}
          >
            {header}
          </div>
        )}

        <div className={cn("px-[var(--ui-spacing-4)] py-[var(--ui-spacing-4)]")}>{children}</div>

        {footer && (
          <div
            className={cn(
              "px-[var(--ui-spacing-4)] py-[var(--ui-spacing-3)]",
              "border-t border-[var(--ui-colors-border-subtle)]"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
