   // src/App.jsx
   import React from "react";
   import {
     BrowserRouter as Router,
     Routes,
     Route,
     Navigate,
     useNavigate,
   } from "react-router-dom";
   import { NavLink } from "react-router-dom"; // Adicionado para o header de produtos

   // Componentes do segundo App.jsx (autenticação)
   import AuthLayout from "./layouts/AuthLayout.jsx";
   import Login from "./pages/Login.jsx";
   import Register from "./pages/Register.jsx";
   import FooterBasilios from "./components/FooterBasilios.jsx";
   import About from "./pages/About.jsx";

   // Componentes do primeiro App.jsx (produtos)
   import Home from "./pages/Home.jsx";
   import CadastrarProduto from "./pages/CadastrarProduto.jsx";

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

   // Layout para páginas de produtos (usando o header do primeiro App.jsx)
   function ProdutoLayout({ children }) {
     return (
       <div className="min-h-screen bg-slate-50 text-slate-900">
         <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
           <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
             <h1 className="text-lg sm:text-xl font-bold">Basilios • Produtos</h1>
             <nav className="flex items-center gap-2">
               <NavLink to="/home" end className={({isActive})=>`px-3 py-1.5 rounded-md text-sm font-medium ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>Home</NavLink>
               <NavLink to="/cadastro" className={({isActive})=>`px-3 py-1.5 rounded-md text-sm font-medium ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>Cadastrar</NavLink>
             </nav>
           </div>
         </header>
         <main className="mx-auto max-w-6xl px-4 py-6">
           {children}
         </main>
       </div>
     );
   }

   /**
    * ============================
    * APP (ROTEADOR + FOOTER)
    * ============================
    * - Router controla as rotas públicas de autenticação e as de produtos;
    * - FooterBasilios fica fora das rotas para aparecer em todas as páginas;
    * - Redirecionamos "/" para "/login" (público);
    * - Adicionadas rotas para produtos com layout próprio.
    */
   export default function App() {
     return (
       <div className="min-h-dvh flex flex-col">
         <main className="flex-1">
           <Router>
             <Routes>
               {/* Raiz -> login */}
               <Route path="/" element={<Navigate to="/login" replace />} />

               {/* Rotas de autenticação (públicas c/ layout) */}
               <Route path="/login" element={<LoginRoute />} />
               <Route path="/register" element={<RegisterRoute />} />

               {/* ✅ Página sobre nós (pública, sem layout especial) */}
               <Route path="/about" element={<About />} />

               {/* Rotas de produtos (com layout próprio, assumindo acesso após login) */}
               <Route path="/home" element={<ProdutoLayout><Home /></ProdutoLayout>} />
               <Route path="/cadastro" element={<ProdutoLayout><CadastrarProduto /></ProdutoLayout>} />

               {/* 404 controlado: qualquer rota desconhecida cai no login */}
               <Route path="*" element={<Navigate to="/login" replace />} />
             </Routes>
           </Router>
         </main>

         {/* Footer global (permanece como no seu código atual) */}
         <FooterBasilios />
       </div>
     );
   }
   