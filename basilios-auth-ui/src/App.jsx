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
import AnalyticsAdm from "./pages/AnalyticsAdm.jsx";

// Layouts
import AuthLayout from "./layouts/AuthLayout.jsx";

// Auth storage
import { authStorage } from "./services/storageAuth.js";

/* ============================
   Guards/Routes helpers
============================ */

// Se já estiver logado, não faz sentido ver login/register
function PublicRoute() {
  return authStorage.isAuthenticated() ? <Navigate to="/home" replace /> : <Outlet />;
}

function RequireAuth() {
  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/* ============================
  rotas
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

function AnalyticsRoute() {
  const navigate = useNavigate();
  return <AnalyticsAdm onGoOrdersBoard={() => navigate("/analytics")}/>;
}


function HomePage() {
  const navigate = useNavigate();
  return <Home onGoHome={() => navigate("/home")} />;
}

function CadastrarProdutoRoute() {
  const navigate = useNavigate();
  return <CadastrarProduto onGoCadastrarProduto={() => navigate("/cadastro")} />;
}


function ProdutoLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
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
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Públicas */}
            <Route path="/about" element={<About />} />
            <Route
              path="/home"
              element={
                <ProdutoLayout>
                  <HomePage />
                </ProdutoLayout>
              }
            />

            {/* Login/Register públicas */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<RegisterRoute />} />
            </Route>
            {/* Áreas privadas */}
            <Route element={<RequireAuth />}>
              <Route
                path="/cadastro"
                element={
                  <ProdutoLayout>
                    <CadastrarProdutoRoute />
                  </ProdutoLayout>
                }
              />
              <Route path="/board" element={<BoardRoute />} />
              <Route path="/analytics" element={<AnalyticsRoute />} />
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
