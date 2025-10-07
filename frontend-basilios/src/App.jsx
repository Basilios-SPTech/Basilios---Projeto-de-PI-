// src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CadastrarProduto from "./pages/CadastrarProduto.jsx"; // usa o seu

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Basilios • Produtos</h1>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={({isActive})=>`px-3 py-1.5 rounded-md text-sm font-medium ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>Home</NavLink>
            <NavLink to="/cadastro" className={({isActive})=>`px-3 py-1.5 rounded-md text-sm font-medium ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>Cadastrar</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<CadastrarProduto />} />
        </Routes>
      </main>
    </div>
  );
}
