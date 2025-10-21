/** Botão suspenso que chama a nossa side bar user*/

import { useEffect, useState, useMemo } from "react";
import SidebarLogin from "./SideBarLogin.jsx";

export default function SidebarToggle({
  label = "Abrir menu",
  side = "left",          // "left" | "right"
  offset = 16,            // px do topo e da lateral
  className = "",
  sidebarProps = {}
}) {
  const [open, setOpen] = useState(false);
  const isLeft = side === "left";

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const btnStyle = useMemo(
    () => ({
      top: offset,
      [isLeft ? "left" : "right"]: offset,
    }),
    [offset, isLeft]
  );

  const close = () => setOpen(false);

  return (
    <>
      {/* BOTÃO FIXO — fica invisível quando a sidebar abre */}
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        style={btnStyle}
        className={[
          "fixed z-[940] h-11 w-11",
          "rounded-full border border-black/10 bg-white/95 backdrop-blur",
          "shadow-lg hover:shadow-xl active:scale-[.98] transition",
          "grid place-items-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40",
          open ? "opacity-0 pointer-events-none" : "opacity-100",
          className
        ].join(" ")}
      >
        {/* Ícone hambúrguer (bonitinho) */}
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
        <span className="sr-only">{label}</span>
      </button>

      {/* OVERLAY + SUA SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-[900]">
          {/* fundo escuro (atrás) */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
          />
          {/* container da sidebar (frente) */}
          <div className="absolute inset-0 z-[950] pointer-events-none">
            <div className="pointer-events-auto">
              <SidebarLogin
                // cobre APIs comuns
                open={open}
                isOpen={open}
                visible={open}
                show={open}
                onClose={close}
                close={close}
                setOpen={setOpen}
                {...sidebarProps}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
