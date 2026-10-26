/** Storage is optional: unavailable or malformed storage must not break rating. */
export function readStored(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); }
  catch { return null; }
}

export function writeStored(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function removeStored(key: string): void {
  try { localStorage.removeItem(key); } catch { /* Storage may be blocked. */ }
}

export function validStatementId(id: string): boolean {
  return /^[12]\.[12]\.(?:[1-9]|[1-9][0-9]|100)$/.test(id);
}

export function cleanAnswers(value: unknown, allowed?: Set<string>): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, rating]) =>
    validStatementId(id) && (!allowed || allowed.has(id)) &&
    typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5
  ));
}

export function cleanBatch(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string =>
    typeof id === "string" && validStatementId(id)
  ))].slice(0, 5);
}
