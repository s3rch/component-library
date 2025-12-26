export interface LogMeta {
  [key: string]: unknown;
}

function formatMeta(meta?: LogMeta): string {
  if (!meta) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [meta_unserializable]";
  }
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(message + formatMeta(meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(message + formatMeta(meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error(message + formatMeta(meta));
  }
};


