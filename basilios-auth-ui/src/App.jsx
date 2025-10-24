
   import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate,} from "react-router-dom";
   import { NavLink } from "react-router-dom"; // Adicionado para o header de produtos

   // Pages
   import Login from "./pages/Login.jsx";
   import Register from "./pages/Register.jsx";
   import FooterBasilios from "./components/FooterBasilios.jsx";
   import About from "./pages/About.jsx";
   import Home from "./pages/Home.jsx";
   import CadastrarProduto from "./pages/CadastrarProduto.jsx";
   import OrdersBoard from "./pages/OrdersBoard.jsx"; 

   // Layouts
   import AuthLayout from "./layouts/AuthLayout.jsx";

   // Rotas
   function LoginRoute() {
     const navigate = useNavigate();
     return (
       <AuthLayout>
         <Login onGoRegister={() => navigate("/register")} />
       </AuthLayout>
     );
   }

  
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
             <CadastrarProduto onGoCadastrarProduto={() => navigate("/cadastro")} />
       )
   }

   function ProdutoLayout({ children }) {
     return (
       <div className="min-h-screen bg-slate-50 text-slate-900">
         <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
           <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
           </div>
         </header>
         <main className="mx-auto max-w-6xl px-4 py-6">
           {children}
         </main>
       </div>
     );
   }

 
   export default function App() {
     return (
       <div className="min-h-dvh flex flex-col">
         <main className="flex-1">
           <Router>
             <Routes>
               {/* Raiz -> home */}
               <Route path="/" element={<Navigate to="/home" replace />} />

               {/* Rotas de autenticação (públicas c/ layout) */}
               <Route path="/login" element={<LoginRoute />} />
               <Route path="/register" element={<RegisterRoute />} />

               {/* ✅ Página sobre nós (pública, sem layout especial) */}
               <Route path="/about" element={<About />} />

               {/* Rotas de produtos (com layout próprio, assumindo acesso após login) */}
               <Route path="/home" element={<ProdutoLayout><Home /></ProdutoLayout>} />
               <Route path="/cadastro" element={<ProdutoLayout><CadastrarProduto /></ProdutoLayout>} />
              
              {/* Rota do Board */}
              <Route path="/board" element={<BoardRoute />} />

               {/* 404 controlado: qualquer rota desconhecida cai na home */}
               <Route path="*" element={<Navigate to="/home" replace />} />
             </Routes>
           </Router>
         </main>

         {/* Footer global (permanece como no seu código atual) */}
         <FooterBasilios />
       </div>
     );
   }