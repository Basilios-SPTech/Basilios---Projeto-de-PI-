export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh grid place-items-center relative">
      {/* Fundo com imagem e blur */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[url('/img.png')] bg-no-repeat bg-cover bg-center"></div>
        <div className="absolute inset-0 backdrop-blur-[0px]"></div>
      </div>

      {/* Card principal */}
      <div className="mx-4 w-full max-w-6xl rounded-xl bg-white shadow-xl md:grid md:grid-cols-2 overflow-hidden min-h-[200px] md:min-h-[500px]">
        {/* Lado esquerdo com logo */}
        <div className="hidden md:block relative">
          <img
            src="/logo.png"
            alt="Basilios Burguer"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Conteúdo dinâmico (Login/Register) */}
        <div className="p-8 md:p-12">{children}</div>
      </div>
    </div>
  )
}
