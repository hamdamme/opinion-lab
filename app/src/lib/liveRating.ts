export function parseLiveRating(value: unknown): number {
  if (typeof value !== "string" || !/^[1-5]$/.test(value.trim())) {
    throw new Error("The model must reply with exactly one integer from 1 to 5. No rating was recorded.");
  }
  return Number(value.trim());
}

export function liveEndpoint(value: string): string {
  const url = new URL(value || "https://api.openai.com/v1");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Enter an HTTPS base URL without credentials, a query, or a fragment.");
  }
  return `${url.href.replace(/\/$/, "")}/chat/completions`;
}
