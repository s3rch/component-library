export const designTokens = {
  colors: {
    background: "#ffffff",
    surface: "#ffffff",
    foreground: "#0f172a",
    muted: "#64748b",
    overlay: "rgba(15, 23, 42, 0.60)",

    borderSubtle: "rgba(15, 23, 42, 0.12)",
    borderStrong: "rgba(15, 23, 42, 0.24)",

    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryForeground: "#ffffff",

    secondary: "#e2e8f0",
    secondaryHover: "#cbd5e1",
    secondaryForeground: "#0f172a",

    danger: "#dc2626",
    dangerHover: "#b91c1c",
    dangerForeground: "#ffffff",

    success: "#16a34a",
    successForeground: "#ffffff",

    focusRing: "#2563eb"
  },
  spacing: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem"
  },
  typography: {
    fontFamily: {
      sans:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"'
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem"
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600"
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5"
    }
  },
  borderRadius: {
    none: "0px",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px"
  },
  sizes: {
    modal: {
      small: "24rem",
      medium: "32rem",
      large: "48rem"
    }
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(15, 23, 42, 0.08)",
    md: "0 6px 16px 0 rgba(15, 23, 42, 0.12)"
  }
} as const;

export type DesignTokens = typeof designTokens;
export type UiCssVarName = `--ui-${string}`;

export function designTokensToCssVars(tokens: DesignTokens = designTokens): Record<UiCssVarName, string> {
  const out: Record<UiCssVarName, string> = {} as Record<UiCssVarName, string>;
  flattenToVars("ui", tokens, out);
  return out;
}

let tokensApplied = false;

/**
 * Applies design tokens as CSS variables on `document.documentElement`.
 * Idempotent and safe in SSR (no-op).
 */
export function ensureDesignTokensApplied(): void {
  if (tokensApplied) return;
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const vars = designTokensToCssVars(designTokens);

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }

  root.dataset.uiTokens = "1";
  tokensApplied = true;
}

function flattenToVars(prefix: string, value: unknown, out: Record<UiCssVarName, string>): void {
  if (!value || typeof value !== "object") return;

  for (const [rawKey, rawVal] of Object.entries(value as Record<string, unknown>)) {
    const key = toKebab(rawKey);
    const nextPrefix = `${prefix}-${key}`;

    if (typeof rawVal === "string" || typeof rawVal === "number") {
      const varName = (`--${nextPrefix}`) as UiCssVarName;
      out[varName] = String(rawVal);
      continue;
    }

    if (rawVal && typeof rawVal === "object") {
      flattenToVars(nextPrefix, rawVal, out);
    }
  }
}

function toKebab(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}


