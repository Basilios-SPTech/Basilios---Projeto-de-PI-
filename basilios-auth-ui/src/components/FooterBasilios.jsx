import logo from "/logoWithoutBackGround.png"; 

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111] text-white border-t border-white/10">
      {/* bloco principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* logo à esquerda */}
              <img
                src={logo}
                alt="Basilios Burguer"
                className="h-28 md:h-36 lg:h-40 w-auto select-none"
                loading="lazy"
              />
              <span className="sr-only">Basilios Burguer</span>
            </div>
            <p className="text-sm text-gray-300">O delicioso sabor, sempre!</p>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              Contato
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="tel:+551148014864" className="hover:text-white">
                  (11) 4801-4864
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/basiliosburger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-2"
                >
                  <InstagramIcon className="h-4 w-4" />
                  @basiliosburger
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/basiliosburger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-2"
                >
                  <FacebookIcon className="h-4 w-4" />
                  /basiliosburger
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <IfodIcon className="h-4 w-4" />
                <a
                  href="https://www.ifood.com.br/delivery/sao-paulo-sp/basilios-burger-e-acai-vila-deodoro/09e48dd3-82b7-40b6-b5db-99dbf9180291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  iFood (peça agora)
                </a>
              </li>
            </ul>
          </div>

          {/* Endereço & Horários */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              Endereço & Horários
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    "R. Basílio da Cunha, 454 - Aclimação, São Paulo - SP, 01544-001"
                  )}`}
                >
                  R. Basílio da Cunha, 454 – Aclimação, São Paulo – SP, 01544-001
                </a>
              </li>
              <li>
                <span className="block">Seg–Qui: 12h–23h</span>
                <span className="block">Sex–Sáb: 12h–00h</span>
                <span className="block">Dom: até 18h</span>
              </li>
            </ul>
          </div>

          {/* Navegação & Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                {/* Página "Sobre nós" futura */}
                <a href="/about" className="text-gray-300 hover:text-white">
                  Sobre nós
                </a>
              </li>
            </ul>

            <div className="pt-4">
              <h3 className="text-sm font-semibold tracking-wide text-white/90">
                Informações 
              </h3>
              <p className="text-sm text-gray-300">
                BASILIO HAMBURGUERIA LTDA
              </p>
              <p className="text-sm text-gray-300">
                © 2018–{year}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* barra final */}
      <div className="bg-[#BB3530] text-white/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-center text-xs">
          Feito com <span aria-hidden>❤️</span> pelo Grupo 7 – SPtech – 2025
        </div>
      </div>
    </footer>
  );
}

/* ===== Ícones SVG minimalistas ===== */
function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.3a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.3z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.07C22 6.49 17.52 2 11.93 2 6.35 2 1.86 6.49 1.86 12.07c0 4.96 3.63 9.08 8.4 9.9v-7H7.9v-2.9h2.36V9.8c0-2.33 1.38-3.62 3.5-3.62.7 0 1.8.12 2.28.2v2.51h-1.28c-1.26 0-1.65.78-1.65 1.58v1.9h2.81l-.45 2.9h-2.36v7c4.77-.82 8.4-4.94 8.4-9.9z" />
    </svg>
  );
}

function IfodIcon({ className = "h-5 w-5" }) {
  // ícone genérico de delivery/bag
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 7V6a5 5 0 0 1 10 0v1h1.5A1.5 1.5 0 0 1 20 8.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5A1.5 1.5 0 0 1 5.5 7H7zm2 0h6V6a3 3 0 0 0-6 0v1z" />
    </svg>
  );
}
