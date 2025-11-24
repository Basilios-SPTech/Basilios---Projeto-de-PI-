// src/services/produtosApi.js

import { http } from "./http.js";

/**
 * Cria um novo produto no backend.
 * POST /api/products
 */
export async function criarProduto(dto) {
  // agora usa a rota nova
  const { data } = await http.post("/api/products", dto);
  return data;
}

/**
 * Lista produtos.
 * GET /api/products?activeOnly=true
 */
export async function listarProdutos(activeOnly = true) {
  const { data } = await http.get("/api/products", {
    params: { activeOnly }, 
  });

  console.log("🔎 Resposta /api/products:", data, "tipo:", typeof data);

  if (Array.isArray(data)) {
    return data;
  }

  console.warn("⚠️ /api/products em formato inesperado:", data);
  return [];
}
