import { http } from "./http.js";

function normalizeStoreResponse(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.content)) return data.content[0] || null;
  if (Array.isArray(data?.items)) return data.items[0] || null;
  if (data?.data && typeof data.data === "object") return data.data;
  if (typeof data === "object") return data;
  return null;
}

function normalizeStoreHoursResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.hours)) return data.hours;
  if (Array.isArray(data?.data?.hours)) return data.data.hours;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getStoreProfile() {
  const candidates = ["/store", "/store/current", "/store/active"];
  let lastError = null;

  for (const endpoint of candidates) {
    try {
      const { data } = await http.get(endpoint);
      const store = normalizeStoreResponse(data);
      if (store) return store;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("Não foi possível carregar os dados da loja.");
}

export async function updateStoreProfile(payload) {
  const { data } = await http.patch("/store", payload);
  return normalizeStoreResponse(data);
}

export async function getStoreHours() {
  const { data } = await http.get("/store/hours");
  return normalizeStoreHoursResponse(data);
}

export async function updateStoreHours(payload) {
  const { data } = await http.put("/store/hours", payload);
  return normalizeStoreHoursResponse(data);
}
