import { http } from "./http.js";

/**
 * @typedef {Object} Address
 * @property {number} id
 * @property {string} rua
 * @property {string} numero
 * @property {string} bairro
 * @property {string} cep
 * @property {string} cidade
 * @property {string} estado
 * @property {string=} complemento
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} enderecoCompleto
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AddressRequest
 * @property {string} rua
 * @property {string} numero
 * @property {string} bairro
 * @property {string} cep
 * @property {string} cidade
 * @property {string} estado
 * @property {string=} complemento
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * Lista os enderecos do usuario autenticado.
 * Contrato esperado: sempre array.
 * @returns {Promise<Address[]>}
 */
export async function listMyAddresses() {
  const { data } = await http.get("/address");
  return Array.isArray(data) ? data : [];
}

/**
 * Busca um endereco por id.
 * @param {number} addressId
 * @returns {Promise<Address>}
 */
export async function getAddressById(addressId) {
  const { data } = await http.get(`/address/${addressId}`);
  return data;
}

/**
 * Cria um endereco para o usuario autenticado.
 * @param {AddressRequest} payload
 * @returns {Promise<Address>}
 */
export async function createAddress(payload) {
  const { data } = await http.post("/address", payload);
  return data;
}

/**
 * Atualiza um endereco por id.
 * @param {number} addressId
 * @param {AddressRequest} payload
 * @returns {Promise<Address>}
 */
export async function updateAddress(addressId, payload) {
  const { data } = await http.patch(`/address/${addressId}`, payload);
  return data;
}

/**
 * Remove (soft delete) um endereco por id.
 * @param {number} addressId
 * @returns {Promise<void>}
 */
export async function deleteAddress(addressId) {
  await http.delete(`/address/${addressId}`);
}
