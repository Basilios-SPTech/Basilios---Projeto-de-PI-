/**faixa animada em loop com o slogan. Props: text, separator, speed, gap, Icon, tone. */


export default function Ticker({
  text = "",
  separator = "",
  speed = 400,
  Icon,
  tone = "red",
  gap = 72,           // espaçamento entre frases
}) {
  const phrase = ` ${separator} ${text} `;
  const repeated = Array.from({ length: 10 }).map((_, i) => (
    <span key={i} aria-hidden="true" className="ticker__chunk">
      {Icon ? <Icon size={18} className="ticker__icon" /> : null}
      {phrase}
    </span>
  ));

  return (
    <div className={`ticker ticker--${tone}`} role="img" aria-label={text}>
      <div
        className="ticker__track"
        style={{ "--ticker-speed": `${speed}s`, "--ticker-gap": `${gap}px` }}
      >
        {repeated}
        {repeated}
      </div>
    </div>
  );
}
