const DEFAULT_API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeApiBase(apiBase) {
  const normalized = normalizeText(apiBase || DEFAULT_API_BASE);
  return normalized.replace(/\/+$/, "");
}

function joinApiAndPath(apiBase, path) {
  const safeBase = normalizeApiBase(apiBase);
  const safePath = normalizeText(path);

  if (!safePath) return "";
  if (!safeBase) return safePath;

  if (safePath.startsWith("/")) {
    return `${safeBase}${safePath}`;
  }

  return `${safeBase}/${safePath}`;
}

export function resolveImageUrl(imageUrl, options = {}) {
  const { apiBase = DEFAULT_API_BASE, fallback = "" } = options;
  const normalized = normalizeText(imageUrl);

  if (!normalized) return fallback;

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  return joinApiAndPath(apiBase, normalized);
}

export function sanitizeImageUrl(url, options = {}) {
  const { placeholder = "/placeholder.jpg", apiBase = DEFAULT_API_BASE } = options;
  const resolved = resolveImageUrl(url, { apiBase, fallback: "" });

  if (!resolved) return placeholder;

  const lowered = resolved.toLowerCase();
  if (lowered.startsWith("javascript:") || lowered.startsWith("data:text/html")) {
    return placeholder;
  }

  if (
    lowered.startsWith("http://") ||
    lowered.startsWith("https://") ||
    lowered.startsWith("/") ||
    lowered.startsWith("data:") ||
    lowered.startsWith("blob:")
  ) {
    return resolved;
  }

  return placeholder;
}

export function extractUploadImageUrl(uploadResponse, options = {}) {
  const { apiBase = DEFAULT_API_BASE, keepRelativeForApi = true } = options;

  const fromString =
    typeof uploadResponse === "string" ? uploadResponse : uploadResponse?.url;

  const normalized = normalizeText(fromString);
  if (!normalized) return null;

  if (!keepRelativeForApi) {
    return normalized;
  }

  const safeBase = normalizeApiBase(apiBase);
  if (safeBase && normalized.startsWith(safeBase)) {
    const suffix = normalized.slice(safeBase.length);
    if (!suffix) return "/";
    return suffix.startsWith("/") ? suffix : `/${suffix}`;
  }

  return normalized;
}
