import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reseta o scroll para o topo da página toda vez que a rota muda.
 * Deve ser colocado dentro de <Router> no App.jsx.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
