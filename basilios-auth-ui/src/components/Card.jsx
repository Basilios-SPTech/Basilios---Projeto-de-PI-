import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const Card = ({ 
  nome = "Produto", 
  preco = 0, 
  descricao = "Descrição do produto", 
  imagem = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop", 
  ingredientes = [], 
  adicionais = [] 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredientesQuantidades, setIngredientesQuantidades] = useState(
    ingredientes.reduce((acc, ing) => ({
      ...acc,
      [ing.nome]: ing.quantidade || 0
    }), {})
  );
  const [adicionaisQuantidades, setAdicionaisQuantidades] = useState(
    adicionais.reduce((acc, add) => ({
      ...acc,
      [add.nome]: 0
    }), {})
  );

  const handleIngredienteChange = (nome, delta) => {
    setIngredientesQuantidades(prev => ({
      ...prev,
      [nome]: Math.max(0, prev[nome] + delta)
    }));
  };

  const handleAdicionalChange = (nome, delta) => {
    setAdicionaisQuantidades(prev => ({
      ...prev,
      [nome]: Math.max(0, prev[nome] + delta)
    }));
  };

  const handleAddToCart = () => {
    const pedido = {
      produto: nome,
      preco,
      ingredientes: ingredientesQuantidades,
      adicionais: adicionaisQuantidades
    };
    console.log('Adicionado ao carrinho:', pedido);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 w-72 border border-gray-200"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="relative">
          <img 
            src={imagem} 
            alt={nome}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-lg font-bold" style={{ color: '#BB3530' }}>
              R$ {preco.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="p-4" style={{ backgroundColor: '#FFFFFF' }}>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#111111' }}>
            {nome}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: '#666666' }}>
            {descricao}
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(17, 17, 17, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl" style={{ backgroundColor: '#FAFAFA' }}>
            {/* Botão Fechar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="absolute top-4 right-4 rounded-full p-2 transition-all z-10 hover:opacity-80"
              style={{ backgroundColor: 'rgba(17, 17, 17, 0.6)', color: '#FFFFFF' }}
            >
              <X size={20} />
            </button>

            {/* Conteúdo do Modal */}
            <div>
              {/* Imagem */}
              <div className="relative">
                <img 
                  src={imagem} 
                  alt={nome}
                  className="w-full h-56 object-cover rounded-t-2xl"
                />
                <div className="absolute bottom-4 left-4 px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                  <p className="text-2xl font-bold" style={{ color: '#BB3530' }}>
                    R$ {preco.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#111111' }}>
                  {nome}
                </h2>
                <p className="mb-6" style={{ color: '#666666' }}>
                  {descricao}
                </p>

                {/* Ingredientes */}
                {ingredientes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>
                      Ingredientes
                    </h3>
                    <div className="space-y-2">
                      {ingredientes.map((ing, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: '#F4F4F4' }}
                        >
                          <span className="font-medium" style={{ color: '#111111' }}>
                            {ing.nome}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIngredienteChange(ing.nome, -1);
                              }}
                              className="p-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{ backgroundColor: '#BB3530', color: '#FFFFFF' }}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold w-8 text-center" style={{ color: '#111111' }}>
                              {ingredientesQuantidades[ing.nome]}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIngredienteChange(ing.nome, 1);
                              }}
                              className="p-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{ backgroundColor: '#5B8267', color: '#FFFFFF' }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionais */}
                {adicionais.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>
                      Adicionais
                    </h3>
                    <div className="space-y-2">
                      {adicionais.map((add, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: '#F4F4F4' }}
                        >
                          <div>
                            <span className="font-medium block" style={{ color: '#111111' }}>
                              {add.nome}
                            </span>
                            {add.preco && (
                              <span className="text-sm" style={{ color: '#E07A5F' }}>
                                +R$ {add.preco.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdicionalChange(add.nome, -1);
                              }}
                              className="p-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{ backgroundColor: '#BB3530', color: '#FFFFFF' }}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold w-8 text-center" style={{ color: '#111111' }}>
                              {adicionaisQuantidades[add.nome]}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdicionalChange(add.nome, 1);
                              }}
                              className="p-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{ backgroundColor: '#5B8267', color: '#FFFFFF' }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão Adicionar ao Carrinho */}
                <button
                  onClick={handleAddToCart}
                  className="w-[70%] mx-auto block font-bold py-4 rounded-xl transition-all hover:opacity-90 text-lg shadow-lg"
                  style={{ backgroundColor: '#BB3530', color: '#FFFFFF' }}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Exportação dupla para flexibilidade
export { Card };
export default Card;


// Forma que recebe os dados 
//  const produtos = [
//     {
//       nome: "Hambúrguer Artesanal",
//       preco: 32.90,
//       descricao: "Delicioso hambúrguer com blend especial de carnes nobres, queijo cheddar derretido, alface fresquinha e molho especial da casa",
//       imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop",
//       ingredientes: [
//         { nome: "Carne", quantidade: 2 },
//         { nome: "Queijo", quantidade: 1 },
//         { nome: "Alface", quantidade: 1 },
//         { nome: "Tomate", quantidade: 2 }
//       ],
//       adicionais: [
//         { nome: "Bacon", preco: 5.00 },
//         { nome: "Ovo", preco: 3.00 },
//         { nome: "Cebola Caramelizada", preco: 4.00 }
//       ]
//     }