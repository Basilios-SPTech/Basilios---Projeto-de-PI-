import { Sun, Moon, CircleOff } from "lucide-react";
import { useState, useEffect } from "react";
import { themeManager } from "../utils/themeManager";

const themes = [
  { key: "light",          label: "Claro",          Icon: Sun      },
  { key: "dark",           label: "Escuro",         Icon: Moon     },
  { key: "high-contrast",  label: "Alto Contraste", Icon: CircleOff },
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState(themeManager.get);

  useEffect(() => {
    themeManager.set(active);
  }, [active]);

  return (
    <div className="theme-switcher">
      <span className="theme-switcher__label">Tema</span>
      <div className="theme-switcher__buttons">
        {themes.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`theme-switcher__btn ${active === key ? "theme-switcher__btn--active" : ""}`}
            aria-label={label}
            title={label}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
