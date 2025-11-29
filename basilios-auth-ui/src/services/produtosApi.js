// src/services/produtosApi.js

import { http } from "./http.js";

/**
 * Cria um novo produto no backend.
 * POST /api/products
 */
export async function criarProduto(dto) {
  const { data } = await http.post("/api/products", dto);
  return data;
}

/**
 * Lista produtos.
 * GET /api/products?activeOnly=true|false
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

/**
 * Atualiza um produto existente.
 * PUT /api/products/{id}
 */
export async function atualizarProduto(id, dto) {
  const { data } = await http.put(`/api/products/${id}`, dto);
  return data;
}

/**
 * Deleta um produto.
 * DELETE /api/products/{id}
 */
export async function deletarProduto(id) {
  await http.delete(`/api/products/${id}`);
}

/**
 * Pausa um produto (tira do menu).
 * POST /api/products/{id}/pause
 */
export async function pausarProduto(id) {
  const { data } = await http.post(`/api/products/${id}/pause`);
  return data;
}

/**
 * Ativa um produto pausado (volta pro menu).
 * POST /api/products/{id}/activate
 */
export async function ativarProduto(id) {
  const { data } = await http.post(`/api/products/${id}/activate`);
  return data;
}
