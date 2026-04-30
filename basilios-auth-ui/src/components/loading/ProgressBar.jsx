import { useEffect, useMemo, useState } from "react";

const DEFAULT_LOADING_MESSAGES = [
  "Preparando seu hambúrguer delicioso...",
  "Selecionando os ingredientes mais frescos...",
  "Caprichando no ponto da carne...",
  "Montando seu pedido com carinho...",
  "Preparando nossos entregadores...",
  "Os preparativos sendo feitos nos mínimos detalhes...",
  "A cozinha da Basilios está a todo vapor...",
  "Finalizando os últimos detalhes do seu pedido...",
];

function pickRandomMessage(messages, previousMessage) {
  if (!messages.length) return "";
  if (messages.length === 1) return messages[0];

  let next = messages[Math.floor(Math.random() * messages.length)];
  while (next === previousMessage) {
    next = messages[Math.floor(Math.random() * messages.length)];
  }
  return next;
}

export default function ProgressBar({
  visible = true,
  message = null,
  progress = null,
  messages = DEFAULT_LOADING_MESSAGES,
  messageIntervalMs = 2400,
  gifSrc = "motodriving.gif",
  gifAlt = "Entregador em movimento",
}) {
  const isDeterminate = progress !== null;
  const availableMessages = useMemo(() => {
    if (Array.isArray(messages) && messages.length > 0) return messages;
    return DEFAULT_LOADING_MESSAGES;
  }, [messages]);

  const [dynamicMessage, setDynamicMessage] = useState(() =>
    message || availableMessages[0] || ""
  );

  useEffect(() => {
    if (!visible) return;

    if (message) {
      setDynamicMessage(message);
      return;
    }

    setDynamicMessage((prev) => pickRandomMessage(availableMessages, prev));

    const timer = window.setInterval(() => {
      setDynamicMessage((prev) => pickRandomMessage(availableMessages, prev));
    }, Math.max(1200, Number(messageIntervalMs) || 2400));

    return () => window.clearInterval(timer);
  }, [visible, message, availableMessages, messageIntervalMs]);

  if (!visible) return null;

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
        @keyframes bikeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-2000 flex flex-col items-center justify-center gap-6"
        style={{
          backgroundColor: "#000000",
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

        <img
          src={gifSrc}
          alt={gifAlt}
          className="w-[80vw] max-w-[720px] h-auto object-contain"
          style={{ animation: "bikeFloat 1.8s ease-in-out infinite" }}
        />

        {/* Mensagem */}
        {dynamicMessage && (
          <p
            className="text-zinc-300 text-sm sm:text-base tracking-[0.18em] uppercase text-center px-6"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          >
            {dynamicMessage}
          </p>
        )}

        {/* Barra */}
        <div className="w-80 sm:w-md h-1 bg-zinc-800 rounded-full overflow-hidden relative">
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
      </div>
    </>
  );
}
