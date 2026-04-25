// src/services/produtosApi.js

import { http } from "./http.js";

function normalizeProductsListResponse(data) {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
  }

  return [];
}

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
 * GET /api/products?activeOnly=true|false&page=0&size=1000&sort=id,desc
 */
export async function listarProdutos(activeOnly = false, page = 0, size = 10) {
  const params = {
    page,
    size,
    sort: "id,desc"
  };

  if (typeof activeOnly === "boolean") {
    params.activeOnly = activeOnly;
  }

  const { data } = await http.get("/products", { params });

  return {
    content: data.content || [],
    last: data.last,
    totalPages: data.totalPages
  };
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
 * Atualiza o status de pausa de um produto.
 * PATCH /api/products/{id}/status
 */
export async function atualizarStatusProduto(id, isPaused) {
  const { data } = await http.patch(`/products/${id}/status`, { isPaused });
  return data;
}
