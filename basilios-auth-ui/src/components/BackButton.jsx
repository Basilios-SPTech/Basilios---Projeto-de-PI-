/** botão de "voltar". Dispara `onClick` (geralmente `navigate(-1)`). Aceita children (ícone + texto). */

export default function BackButton({ onClick, children }) {
  return (
    <button className="btn btn--ghost back-btn" onClick={onClick}>
      {children}
    </button>
  );
}
