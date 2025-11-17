/** Sider bar base para construir outras sides bar*/
import { X } from "lucide-react";

export default function SidebarBase({
  isOpen,
  onClose,
  items = [],     // [{icon: Icon, label: 'Início', href: '#home'}]
  title = "MENU",
  footer = { version: "1.0.0", brand: "© 2025 - Basilios" },
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/50 animate-[fadeIn_.3s_ease-out]"
      />
      {/* drawer */}
      <aside
        className="
          fixed left-0 top-0 z-[1000] h-dvh w-[320px] overflow-y-auto
          bg-neutral-900 p-6 shadow-2xl
          animate-[slideIn_.3s_ease-out]
        "
      >
        {/* header */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-4">
          <span className="text-lg font-bold tracking-tight text-red-400">{title}</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-neutral-200 hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-2">
          {items.map(({ icon: Icon, label, href }, i) => (
            <a
              key={`${label}-${i}`}
              href={href}
              className="
                group flex items-center gap-3 rounded-xl px-4 py-3 font-semibold
                text-neutral-100 transition
                hover:translate-x-1 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600
                hover:shadow-[0_6px_20px_rgba(232,93,93,.25)]
              "
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* footer */}
        <div className="mt-12 border-t border-neutral-800 pt-6 text-center text-sm text-neutral-400">
          <p>Versão {footer.version}</p>
          <p>{footer.brand}</p>
        </div>
      </aside>

      {/* keyframes (escopo local) */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  );
}
