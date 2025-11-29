// src/utils/apiMappers.js
export function extractSingleValue(data) {
  if (data == null) return null;

  // se já vier número
  if (typeof data === "number") return data;

  // se vier string "13.00", "18"...
  if (typeof data === "string") {
    const num = Number(data.replace(",", "."));
    return Number.isNaN(num) ? data : num;
  }

  // se vier array de 1 elemento: [ "13.00" ]
  if (Array.isArray(data) && data.length === 1) {
    return extractSingleValue(data[0]);
  }

  // se vier objeto com uma única chave: { "13.00": null } ou { value: "13.00" }
  if (typeof data === "object") {
    const values = Object.values(data);
    if (values.length === 1) {
      return extractSingleValue(values[0]);
    }
  }

  // fallback
  return data;
}

export function extractStringArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map(String);
  }
  // se vier objeto tipo { items: [...] }
  if (typeof data === "object") {
    const values = Object.values(data);
    if (values.length === 1 && Array.isArray(values[0])) {
      return values[0].map(String);
    }
  }
  // se vier string única
  if (typeof data === "string") {
    return [data];
  }
  return [];
}
