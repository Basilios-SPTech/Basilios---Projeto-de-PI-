// src/services/produtosApi.js

import { http } from "./http.js";

/**
 * Cria um novo produto no backend.
 * Requer token válido (admin) porque o endpoint é protegido.
 * Envia para POST /api/menu
 */
export async function criarProduto(dto) {
  const response = await http.post("/api/menu", dto);
  return response.data;
}
