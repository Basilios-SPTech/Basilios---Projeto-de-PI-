/** Barra de pesquisa presente no header*/

import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar...",
  width = 250, // mantém o mesmo default
}) {
  return (
    <div className="search-container" style={{ width }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#3a3a3a",
          borderRadius: "8px",
          padding: "0.2rem 0.8rem",
          border: "1px solid rgba(245, 245, 240, 0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#e85d5d";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232, 93, 93, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(245, 245, 240, 0.2)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Search
          className="search-icon"
          size={18}
          style={{ color: "#888", marginRight: "0.5rem", flexShrink: 0 }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="search-input"
          style={{
            background: "none",
            border: "none",
            color: "#f5f5f0",
            outline: "none",
            width: "100%",
            fontSize: "0.9rem",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: "600",
          }}
        />
      </div>
    </div>
  );
}
