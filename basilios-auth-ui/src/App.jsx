import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import FooterBasilios from "./components/FooterBasilios.jsx";
import BoardTrello from "./components/BoardTrello.jsx";
import Header  from "./components/header.jsx";

// Rota de Login com layout aplicado e navegação para "Cadastrar-se"
function LoginRoute() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Login onGoRegister={() => navigate("/register")} />
    </AuthLayout>
  );
}

// Rota de Cadastro com layout aplicado e navegação para "Já tem conta? Entre"
function RegisterRoute() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Register onGoLogin={() => navigate("/login")} />
    </AuthLayout>
  );
}

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
       
        {/* <Router> */}
          {/* <Routes> */}
            {/* Raiz -> login */}
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            {/* Rotas de autenticação (públicas c/ layout) */}
            {/* <Route path="/login" element={<LoginRoute />} /> */}
            {/* <Route path="/register" element={<RegisterRoute />} /> */}

            {/* 404 controlado: qualquer rota desconhecida cai no login */}
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          {/* </Routes> */}
        {/* </Router> */}
        <BoardTrello />

      </main>

      {/* Footer global (permanece como no seu código atual) */}
      <FooterBasilios />
    </div>
  );
}
