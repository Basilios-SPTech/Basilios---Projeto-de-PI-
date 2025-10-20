import React from "react";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import FooterBasilios from "./components/FooterBasilios.jsx";
import AppRoutes from "./routes/index.jsx"

/**
 * ============================
 * APP (ROTEADOR + FOOTER)
 * ============================
 * - Router controla as rotas públicas de autenticação;
 * - FooterBasilios fica fora das rotas para aparecer em todas as páginas públicas;
 * - Redirecionamos "/" e qualquer caminho desconhecido para "/login".
 */
export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
    <main className="flex-1">
       <Router>
          <AppRoutes />
        </Router>
      </main>
      {/* Footer global (permanece como no seu código atual) */}
      <FooterBasilios />
    </div>
  );
}
