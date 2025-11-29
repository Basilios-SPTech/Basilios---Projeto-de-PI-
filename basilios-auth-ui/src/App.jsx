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
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PixCheckout from "./pages/PixCheckout.jsx";
import StatusOrderPage from "./pages/StatusOrderPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Layouts
import AuthLayout from "./layouts/AuthLayout.jsx";

// Auth storage
import { authStorage } from "./services/storageAuth.js";

/* ============================
   Guards/Routes helpers
============================ */

// Se já estiver logado, não faz sentido ver login/register
function PublicRoute() {
  return authStorage.isAuthenticated() ? (
    <Navigate to="/home" replace />
  ) : (
    <Outlet />
  );
}

// 🔻 SEM ROLES: exige apenas estar logado
function RequireAuth() {
  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/* ============================
   Wrappers (rotas com layout)
============================ */

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <>
      <AuthLayout>
        <Login
          onGoRegister={() => navigate("/register")}
          onGoHome={() => navigate("/home")}
        />
      </AuthLayout>
      <FooterBasilios />
    </>
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  return (
    <>
      <AuthLayout>
        <Register onGoLogin={() => navigate("/login")} />
      </AuthLayout>
      <FooterBasilios />
    </>
  );
}

function BoardRoute() {
  const navigate = useNavigate();
  return <OrdersBoard onGoOrdersBoard={() => navigate("/board")} />;
}

function CheckoutRoute() {
  const navigate = useNavigate();
  return <CheckoutPage onGoCheckout={() => navigate("/checkout")} />;
}

function PixRoute() {
  const navigate = useNavigate();
  return (
    <>
      <PixCheckout onGoCheckout={() => navigate("/pix-checkout")} />
      <FooterBasilios />
    </>
  );
}

function OrderStatusRoute() {
  const navigate = useNavigate();
  return <StatusOrderPage onGoOrderStatus={() => navigate("/order-status")} />;
}

function HomePage() {
  const navigate = useNavigate();
  return <Home onGoHome={() => navigate("/home")} />;
}

function CadastrarProdutoRoute() {
  const navigate = useNavigate();
  return (
    <CadastrarProduto onGoCadastrarProduto={() => navigate("/cadastro")} />
  );
}

/* ============================
   Layout público (produtos)
============================ */

function ProdutoLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
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
            <Route path="/about" element={<><About /><FooterBasilios /></>} />
            <Route
              path="/home"
              element={
                <>
                  <ProdutoLayout>
                    <HomePage />
                  </ProdutoLayout>
                  <FooterBasilios />
                </>
              }
            />

            {/* Login/Register públicas, mas se já logado, manda pra /home */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<RegisterRoute />} />
            </Route>

            {/* 🔻 SEM ROLES: áreas internas exigem apenas login */}
            <Route element={<RequireAuth />}>
              <Route
                path="/cadastro"
                element={
                  <ProdutoLayout>
                    <CadastrarProdutoRoute />
                  </ProdutoLayout>
                }
              />
              
            <Route path="/board" element={<BoardRoute />} /></Route>

            <Route path="/dashboard" element={<ProdutoLayout><Dashboard /></ProdutoLayout>} />

            <Route path="/checkout" element={<CheckoutRoute />} />

            <Route path="/pix-checkout" element={<PixRoute />} />

            <Route path="/order-status" element={<StatusOrderPage />} />

            {/* 404 -> home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </main>

      
    </div>
  );
}
