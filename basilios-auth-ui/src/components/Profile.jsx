import React, { useState } from "react";
import { Edit } from "lucide-react";

export default function Profile() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [enderecos, setEnderecos] = useState(["Rua"]);
  const [enderecosExpandido, setEnderecosExpandido] = useState(true);

  const adicionarEndereco = () => {
    setEnderecos([...enderecos, "Rua"]);
  };

  const editarEndereco = (index) => {
    // Lógica para editar endereço
    console.log("Editar endereço", index);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      {/* Avatar */}
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-black rounded-full mb-2"></div>
        <div className="absolute mt-16">
          <div className="w-16 h-10 bg-black rounded-t-full"></div>
        </div>
      </div>

      <h1 className="text-xl mb-8">Olá, Usuário</h1>

      {/* Minhas Informações */}
      <div className="w-full max-w-2xl bg-zinc-900 rounded-lg p-6 mb-6">
        <h2 className="text-lg mb-6">Minhas informações</h2>

        {/* Nome */}
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm mr-4">Nome</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 bg-white rounded-full px-4 py-2 text-black"
            />
            <button className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700">
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Telefone */}
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm mr-4">telefone</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="flex-1 bg-white rounded-full px-4 py-2 text-black"
            />
            <button className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700">
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Data de Nascimento */}
        <div className="flex items-center justify-between mb-6">
          <label className="text-sm mr-4">data de nascimento</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="flex-1 bg-white rounded-full px-4 py-2 text-black"
            />
            <button className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700">
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Botão Alterar Senha */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-medium uppercase">
          Alterar Senha
        </button>
      </div>

      {/* Meus Endereços */}
      <div className="w-full max-w-2xl bg-zinc-900 rounded-lg p-6">
        <div
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setEnderecosExpandido(!enderecosExpandido)}
        >
          <h2 className="text-lg">Meus endereços</h2>
          <span
            className={`transform transition-transform ${enderecosExpandido ? "rotate-180" : ""}`}
          >
            ▲
          </span>
        </div>

        {enderecosExpandido && (
          <>
            {enderecos.map((endereco, index) => (
              <div key={index} className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={endereco}
                  readOnly
                  className="flex-1 bg-white rounded-full px-4 py-2 text-black"
                />
                <button
                  onClick={() => editarEndereco(index)}
                  className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                >
                  <Edit size={16} />
                </button>
              </div>
            ))}

            {/* Botão Adicionar Endereço */}
            <button
              onClick={adicionarEndereco}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-medium mt-4"
            >
              Adicionar Endereço
            </button>
          </>
        )}
      </div>
    </div>
  );
}
