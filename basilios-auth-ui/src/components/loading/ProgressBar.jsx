export default function ProgressBar({
  visible = true,
  message = "Carregando...",
  progress = null,
}) {
  if (!visible) return null;

  const isDeterminate = progress !== null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(250%);  }
          100% { transform: translateX(250%);  }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes barFill {
          from { width: 0%; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-zinc-950/90 backdrop-blur-sm"
        style={{
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Porcentagem (só no modo determinado) */}
        {isDeterminate && (
          <span className="text-zinc-300 text-2xl font-medium tabular-nums">
            {Math.min(100, Math.round(progress))}
            <span className="text-zinc-600 text-sm">%</span>
          </span>
        )}

        {/* Barra */}
        <div className="w-64 h-[3px] bg-zinc-800 rounded-full overflow-hidden relative">
          {isDeterminate ? (
            /* Barra determinada */
            <div
              className="h-full bg-rose-700-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          ) : (
            /* Barra indeterminada com slider */
            <span
              className="absolute top-0 left-0 h-full w-1/3 bg-rose-700 rounded-full"
              style={{ animation: "slide 1.4s ease-in-out infinite" }}
            />
          )}
        </div>

        {/* Mensagem */}
        {message && (
          <p
            className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          >
            {message}
          </p>
        )}
      </div>
    </>
  );
}
