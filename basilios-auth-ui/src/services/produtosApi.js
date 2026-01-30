// src/services/produtosApi.js

import { http } from "./http.js";

/**
 * Cria um novo produto no backend.
 * POST /api/products
 */
export async function criarProduto(dto) {
  const { data } = await http.post("/products", dto);
  return data;
}

/**
 * Lista produtos.
 * GET /api/products?activeOnly=true|false
 */
export async function listarProdutos(activeOnly = false) {
  const params = {};

  if (typeof activeOnly === "boolean") {
    params.activeOnly = activeOnly;
  }

  const { data } = await http.get("/products", { params });
  return data;
}

/**
 * Atualiza um produto existente.
 * PATCH /api/products/{id}
 */
export async function atualizarProduto(id, dto) {
  const { data } = await http.patch(`/products/${id}`, dto);
  return data;
}

/**
 * Deleta um produto.
 * DELETE /api/products/{id}
 */
export async function deletarProduto(id) {
  await http.delete(`/products/${id}`);
}

/**
 * Pausa um produto (tira do menu).
 * POST /api/products/{id}/pause
 */
export async function pausarProduto(id) {
  const { data } = await http.post(`/products/${id}/pause`);
  return data;
}

/**
 * Ativa um produto pausado (volta pro menu).
 * POST /api/products/{id}/activate
 */
export async function ativarProduto(id) {
  const { data } = await http.post(`/products/${id}/activate`);
  return data;
}
