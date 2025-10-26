import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

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

// Auth storage (fonte da verdade: token + claims + roles)
import { authStorage } from "./services/storageAuth.js";

/* ============================
   Guards/Routes helpers
============================ */

// Se já estiver logado, não faz sentido ver login/register
function PublicRoute() {
  return authStorage.isAuthenticated() ? <Navigate to="/home" replace /> : <Outlet />;
}

// Guard genérico: exige login e, opcionalmente, um conjunto de roles
function RequireAuth({ roles = [] }) {
  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (roles.length > 0 && !authStorage.hasRole(...roles)) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

/* ============================
   Wrappers (rotas com layout)
============================ */

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Login
        onGoRegister={() => navigate("/register")}
        onGoHome={() => navigate("/home")}
      />
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

function BoardRoute() {
  const navigate = useNavigate();
  return <OrdersBoard onGoOrdersBoard={() => navigate("/board")} />;
}

function HomePage() {
  const navigate = useNavigate();
  return <Home onGoHome={() => navigate("/home")} />;
}

function CadastrarProdutoRoute() {
  const navigate = useNavigate();
  return <CadastrarProduto onGoCadastrarProduto={() => navigate("/cadastro")} />;
}

/* ============================
   Layout público (produtos)
============================ */

function ProdutoLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Cabeçalho simples / slots */}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

/* ============================
   App
============================ */

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1">
        <Router>
          {/* Toast global */}
          <Toaster position="top-center" />

          <Routes>
            {/* Raiz -> home (pública) */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Telas públicas SEM login obrigatório */}
            <Route path="/about" element={<About />} />
            <Route
              path="/home"
              element={
                <ProdutoLayout>
                  <HomePage />
                </ProdutoLayout>
              }
            />

            {/* Login/Register públicas, mas se já logado, redireciona pra /home */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<RegisterRoute />} />
            </Route>

            {/* Áreas internas protegidas por ROLE_ADMIN */}
            <Route element={<RequireAuth roles={["ROLE_ADMIN"]} />}>
              <Route
                path="/cadastro"
                element={
                  <ProdutoLayout>
                    <CadastrarProdutoRoute />
                  </ProdutoLayout>
                }
              />
              <Route path="/board" element={<BoardRoute />} />
            </Route>

            {/* 404 -> home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </main>

      <FooterBasilios />
    </div>
  );
}
