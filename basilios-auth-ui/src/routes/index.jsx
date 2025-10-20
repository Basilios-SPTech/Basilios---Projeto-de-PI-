import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home  from "../pages/Home.jsx";
import CadastrarProduto from "../pages/CadastrarProduto.jsx";
import OrdersBoard from "../pages/OrdersBoard.jsx";

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

function BoardRoute(){
    const navigate = useNavigate();
    return(
          <OrdersBoard onGoOrdersBoard={() => navigate("/board")} />
    )
}

function HomePage(){
    const navigate = useNavigate();
    return(
          <Home onGoHome={() => navigate("/home")} />
    )
}

function CadastrarProdutoRoute(){
    const navigate = useNavigate();
    return(
          <CadastrarProduto onGoCadastrarProduto={() => navigate("/cadastrar-produto")} />
    )
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Raiz -> login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas de autenticação (públicas c/ layout) */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />

      <Route path="/home" element={<Home />} />
      <Route path="/cadastrar-produto" element={<CadastrarProduto />} />

      {/* Rota do Board */}
      <Route path="/board" element={<BoardRoute />} />

      {/* 404 controlado: qualquer rota desconhecida cai no login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}