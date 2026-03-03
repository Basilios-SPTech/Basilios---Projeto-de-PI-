import { X, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Modal exibido quando um usuário não autenticado tenta finalizar compra.
 * Oferece opções de Login ou Cadastro e salva redirect para voltar ao checkout.
 */
export default function AuthRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGo = (path) => {
    // Salva destino para redirecionar após login/cadastro
    try {
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
    } catch {}
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 bg-black/50 z-[1100] animate-[fadeIn_.2s_ease-out]"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        aria-label="Fechar modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-[scaleIn_.25s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Ícone */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-50 p-4 rounded-full">
              <LogIn className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Texto */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Faça login para continuar
          </h3>
          <p className="text-gray-500 text-center text-sm mb-6">
            Para finalizar sua compra, você precisa estar logado.
            Seu carrinho será mantido!
          </p>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleGo("/login")}
              className="flex items-center justify-center gap-2 w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Entrar na minha conta
            </button>

            <button
              onClick={() => handleGo("/register")}
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-xl border-2 border-gray-200 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Criar uma conta
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Seu carrinho ficará salvo enquanto você faz login ✨
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </>
  );
}
