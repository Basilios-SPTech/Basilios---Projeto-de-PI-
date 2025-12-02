/** botão de "voltar". Dispara `onClick` (geralmente `navigate(-1)`). Aceita children (ícone + texto). */

export default function BackButton({ onClick, children, className = "", ...rest }) {
  const cls = ["btn", "btn--ghost", "back-btn", className].filter(Boolean).join(" ");
  return (
    <button className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
