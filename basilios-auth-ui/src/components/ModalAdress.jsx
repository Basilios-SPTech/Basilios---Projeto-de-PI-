import React, { useState } from 'react';
import { X, Plus, MapPin, Trash2, Star } from 'lucide-react';

// Componente principal
const AddressModal = () => {
  // Estado para controlar se o modal está aberto ou fechado
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para armazenar a lista de endereços
  // Este array será substituído pela resposta da API Spring Boot
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      rua: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      principal: true // Campo que indica se é o endereço principal
    },
    {
      id: 2,
      rua: 'Av. Paulista',
      numero: '1000',
      complemento: '',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      principal: false
    }
  ]);

  // Estado para controlar se está mostrando o formulário de novo endereço
  const [showForm, setShowForm] = useState(false);

  // Estado para armazenar os dados do novo endereço sendo criado
  const [newAddress, setNewAddress] = useState({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    principal: false
  });

  // Função para abrir o modal
  const openModal = () => {
    setIsOpen(true);
    // INTEGRAÇÃO: Aqui você fará a chamada GET para buscar endereços do backend
    // Exemplo:
    // fetch('http://localhost:8080/api/enderecos')
    //   .then(response => response.json())
    //   .then(data => setAddresses(data))
    //   .catch(error => console.error('Erro ao buscar endereços:', error));
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsOpen(false);
    setShowForm(false);
    // Limpa o formulário ao fechar
    setNewAddress({
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: false
    });
  };

  // Função para atualizar os campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para definir um endereço como principal
  const handleSetPrincipal = (id) => {
    // INTEGRAÇÃO: Aqui você fará a chamada PUT/PATCH para atualizar no backend
    // Exemplo:
    // fetch(`http://localhost:8080/api/enderecos/${id}/principal`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // })
    // .then(response => response.json())
    // .then(data => {
    //   // Atualiza a lista localmente
    //   setAddresses(prev => prev.map(addr => ({
    //     ...addr,
    //     principal: addr.id === id
    //   })));
    // })
    // .catch(error => console.error('Erro ao definir endereço principal:', error));

    // Por enquanto, atualiza apenas localmente
    // Remove o "principal" de todos e define apenas no endereço selecionado
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      principal: addr.id === id
    })));
  };

  // Função para adicionar um novo endereço
  const handleAddAddress = () => {
    // Validação básica - verifica se os campos obrigatórios estão preenchidos
    if (!newAddress.rua || !newAddress.numero || !newAddress.bairro || 
        !newAddress.cidade || !newAddress.estado || !newAddress.cep) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // INTEGRAÇÃO: Aqui você fará a chamada POST para salvar no backend
    // Exemplo:
    // fetch('http://localhost:8080/api/enderecos', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(newAddress)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   // Se este endereço foi marcado como principal, remove o principal dos outros
    //   if (data.principal) {
    //     setAddresses(prev => prev.map(addr => ({ ...addr, principal: false })));
    //   }
    //   // Adiciona o novo endereço retornado pelo backend (com ID gerado)
    //   setAddresses(prev => [...prev, data]);
    //   setShowForm(false);
    //   // Limpa o formulário
    //   setNewAddress({...});
    // })
    // .catch(error => console.error('Erro ao salvar endereço:', error));

    // Por enquanto, adiciona localmente com ID temporário
    const addressWithId = {
      ...newAddress,
      id: Date.now() // ID temporário - será substituído pelo ID do banco
    };
    
    // Se este endereço é principal, remove principal dos outros
    if (addressWithId.principal) {
      setAddresses(prev => prev.map(addr => ({ ...addr, principal: false })));
    }
    
    setAddresses(prev => [...prev, addressWithId]);
    setShowForm(false);
    
    // Limpa o formulário
    setNewAddress({
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: false
    });
  };

  // Função para deletar um endereço
  const handleDeleteAddress = (id) => {
    // INTEGRAÇÃO: Aqui você fará a chamada DELETE para remover no backend
    // Exemplo:
    // fetch(`http://localhost:8080/api/enderecos/${id}`, {
    //   method: 'DELETE'
    // })
    // .then(() => {
    //   // Remove da lista local após confirmação do backend
    //   setAddresses(prev => prev.filter(addr => addr.id !== id));
    // })
    // .catch(error => console.error('Erro ao deletar endereço:', error));

    // Por enquanto, remove apenas localmente
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      {/* ==================== INÍCIO DO BOTÃO (SERÁ UM COMPONENTE SEPARADO) ==================== */}
      {/* 
        PROPRIEDADES QUE O BOTÃO DEVE RECEBER:
        - onOpen: função callback que será chamada ao clicar (ex: setIsOpen(true))
        
        EXEMPLO DE USO NO COMPONENTE PAI:
        <AddressButton onOpen={() => setIsOpen(true)} />
      */}
      <button
        onClick={openModal}
        className="bg-[#BB3530] hover:bg-[#a02d29] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
      >
        <MapPin size={20} />
        Meus Endereços
      </button>
      {/* ==================== FIM DO BOTÃO (SERÁ UM COMPONENTE SEPARADO) ==================== */}

      {/* Modal - só aparece quando isOpen é true */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          {/* Container do modal com fundo branco */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between p-6 border-b border-[#F4F4F4]">
              <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-2">
                <MapPin className="text-[#BB3530]" size={28} />
                Meus Endereços
              </h2>
              {/* Botão de fechar */}
              <button
                onClick={closeModal}
                className="text-[#111111] hover:text-[#BB3530] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo do modal - com scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Botão para mostrar formulário de novo endereço */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full border-2 border-dashed border-[#E07A5F] rounded-lg p-4 mb-4 hover:border-[#BB3530] hover:bg-[#F4F4F4] transition-colors flex items-center justify-center gap-2 text-[#E07A5F] hover:text-[#BB3530]"
                >
                  <Plus size={20} />
                  Adicionar Novo Endereço
                </button>
              )}

              {/* Formulário para adicionar novo endereço */}
              {showForm && (
                <div className="bg-[#F4F4F4] rounded-lg p-6 mb-6 border border-[#E07A5F]">
                  <h3 className="text-lg font-semibold text-[#111111] mb-4">Novo Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campo: Rua */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Rua *
                      </label>
                      <input
                        type="text"
                        name="rua"
                        value={newAddress.rua}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: Rua das Flores"
                      />
                    </div>

                    {/* Campo: Número */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={newAddress.numero}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: 123"
                      />
                    </div>

                    {/* Campo: Complemento */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="complemento"
                        value={newAddress.complemento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: Apto 45"
                      />
                    </div>

                    {/* Campo: Bairro */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        name="bairro"
                        value={newAddress.bairro}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: Centro"
                      />
                    </div>

                    {/* Campo: Cidade */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        value={newAddress.cidade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: São Paulo"
                      />
                    </div>

                    {/* Campo: Estado */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        name="estado"
                        value={newAddress.estado}
                        onChange={handleInputChange}
                        maxLength="2"
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none uppercase bg-white text-[#111111]"
                        placeholder="Ex: SP"
                      />
                    </div>

                    {/* Campo: CEP */}
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">
                        CEP *
                      </label>
                      <input
                        type="text"
                        name="cep"
                        value={newAddress.cep}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E07A5F] rounded-lg focus:ring-2 focus:ring-[#BB3530] focus:border-transparent outline-none bg-white text-[#111111]"
                        placeholder="Ex: 01234-567"
                      />
                    </div>

                    {/* Checkbox: Endereço Principal */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAddress.principal}
                          onChange={(e) => setNewAddress(prev => ({
                            ...prev,
                            principal: e.target.checked
                          }))}
                          className="w-4 h-4 text-[#BB3530] border-[#E07A5F] rounded focus:ring-2 focus:ring-[#BB3530] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-[#111111] flex items-center gap-1">
                          <Star size={16} className="text-[#E07A5F]" />
                          Definir como endereço principal
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAddAddress}
                      className="flex-1 bg-[#5B8267] hover:bg-[#4a6b54] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Salvar Endereço
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setNewAddress({
                          rua: '',
                          numero: '',
                          complemento: '',
                          bairro: '',
                          cidade: '',
                          estado: '',
                          cep: '',
                          principal: false
                        });
                      }}
                      className="flex-1 bg-[#F4F4F4] hover:bg-[#e5e5e5] text-[#111111] px-4 py-2 rounded-lg font-medium transition-colors border border-[#E07A5F]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de endereços existentes */}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  // Mensagem quando não há endereços
                  <div className="text-center py-12 text-[#E07A5F]">
                    <MapPin size={48} className="mx-auto mb-3" />
                    <p>Nenhum endereço cadastrado ainda</p>
                  </div>
                ) : (
                  // Mapeia e exibe cada endereço
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-white rounded-lg p-4 hover:shadow-lg transition-all ${
                        address.principal 
                          ? 'border-2 border-[#BB3530] shadow-md' 
                          : 'border border-[#E07A5F]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* Badge de endereço principal */}
                          {address.principal && (
                            <div className="inline-flex items-center gap-1 bg-[#BB3530] text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                              <Star size={14} fill="white" />
                              Endereço Principal
                            </div>
                          )}
                          
                          {/* Linha 1: Rua e número */}
                          <h3 className="font-semibold text-[#111111] text-lg mb-1">
                            {address.rua}, {address.numero}
                          </h3>
                          
                          {/* Linha 2: Complemento (se existir) */}
                          {address.complemento && (
                            <p className="text-[#111111] text-sm mb-1 opacity-70">
                              {address.complemento}
                            </p>
                          )}
                          
                          {/* Linha 3: Bairro */}
                          <p className="text-[#111111] text-sm mb-1 opacity-70">
                            {address.bairro}
                          </p>
                          
                          {/* Linha 4: Cidade, Estado e CEP */}
                          <p className="text-[#111111] text-sm opacity-70">
                            {address.cidade} - {address.estado} | CEP: {address.cep}
                          </p>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex gap-2 ml-4">
                          {/* Botão de definir como principal - aparece em todos */}
                          <button
                            onClick={() => handleSetPrincipal(address.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              address.principal
                                ? 'text-[#111111] cursor-default'
                                : 'text-[#E07A5F] hover:text-[#BB3530] hover:bg-[#F4F4F4]'
                            }`}
                            title={address.principal ? "Endereço principal" : "Definir como principal"}
                            disabled={address.principal}
                          >
                            <Star size={20} fill={address.principal ? "#111111" : "none"} />
                          </button>
                          
                          {/* Botão de deletar */}
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-[#BB3530] hover:text-white hover:bg-[#BB3530] p-2 rounded-lg transition-colors"
                            title="Remover endereço"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rodapé do modal */}
            <div className="border-t border-[#F4F4F4] p-6 bg-[#F4F4F4]">
              <button
                onClick={closeModal}
                className="w-full bg-[#111111] hover:bg-[#2a2a2a] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import AddressModal from './components/AddressModal';






export default AddressModal;