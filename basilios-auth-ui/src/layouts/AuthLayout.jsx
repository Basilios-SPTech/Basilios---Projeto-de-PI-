export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh grid place-items-center relative py-6 md:py-0">
      {/* Fundo com imagem e blur */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[url('/img.png')] bg-no-repeat bg-cover bg-center"></div>
        <div className="absolute inset-0 backdrop-blur-[0px]"></div>
      </div>

      {/* Card principal */}
      <div className="mx-4 my-6 w-full max-w-6xl rounded-xl bg-white shadow-xl md:grid md:grid-cols-2 overflow-hidden">
        {/* Lado esquerdo com logo */}
        <div className="hidden md:block relative min-h-[500px]">
          <img
            src="/logo.png"
            alt="Basilios Burguer"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Conteúdo dinâmico (Login/Register) */}
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  )
}
