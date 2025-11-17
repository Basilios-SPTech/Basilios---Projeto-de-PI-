/**logo linkada pra home. Mostra a imagem da marca e leva para `to` (default "/"). */

import { Link } from "react-router-dom";

export default function LogoLink({ to = "/" }) {
  return (
    <Link to={to} className="logo-link" aria-label="Ir para a home">
      <img src="/logoWithoutBackGround.png" alt="Basilios" className="logo-img" />
    </Link>
  );
}
