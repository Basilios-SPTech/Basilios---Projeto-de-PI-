/**
 * OrbitalRingLoading
 * Uso: <OrbitalRingLoading visible={true} message="Carregando..." />
 */
export default function OrbitLoading({
  visible = true,
  message = "Carregando...",
}) {
  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes spinCW  { to { transform: rotate(360deg); } }
        @keyframes spinCCW { to { transform: rotate(-360deg); } }
        @keyframes fadeIn  {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.3s ease-out" }}
      >
        {/* Orbital */}
        <div className="relative w-20 h-20">
          {/* Anel externo */}
          <span
            className="absolute inset-0 rounded-full border-2 border-zinc-800 border-t-rose-400"
            style={{ animation: "spinCW 1s linear infinite" }}
          />
          {/* Anel médio */}
          <span
            className="absolute inset-3 rounded-full border-2 border-zinc-800 border-r-rose-300"
            style={{ animation: "spinCCW 0.75s linear infinite" }}
          />
          {/* Anel interno */}
          <span
            className="absolute inset-6 rounded-full border-2 border-zinc-800 border-b-rose-200"
            style={{ animation: "spinCW 0.5s linear infinite" }}
          />
          {/* Ponto central */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="w-2 h-2 rounded-full bg-rose-400"
              style={{ animation: "pulse 1s ease-in-out infinite" }}
            />
          </span>
        </div>

        {/* Mensagem */}
        {message && (
          <p
            className="mt-8 text-zinc-400 text-xs tracking-[0.3em] uppercase"
            style={{
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </>
  );
}
