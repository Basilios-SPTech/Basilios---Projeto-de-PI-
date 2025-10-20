
/**card de diferencial (ícone + título + texto). Estilização controlada via CSS; aceita className extra. */
export default function FeatureCard({ icon: Icon, title, text, className = "" }) {
  return (
    <article className={`feature-card ${className}`}>
      <div className="feature-card__icon">
        <Icon aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
