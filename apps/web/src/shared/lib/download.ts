export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function getFilenameFromContentDisposition(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;

  // Very small parser for: attachment; filename="file.csv"
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(contentDisposition);
  if (!match) return fallback;
  const raw = match[1];
  if (!raw) return fallback;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}







