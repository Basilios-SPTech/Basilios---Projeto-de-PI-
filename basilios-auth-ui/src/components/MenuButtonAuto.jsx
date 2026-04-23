/**
 * Escolhe automaticamente a sidebar (Adm ou User)
 * com base no role do usuário logado.
 *
 * - ROLE_FUNCIONARIO  → MenuButtonAdm  (sidebar completa)
 * - ROLE_CLIENTE      → MenuButton     (sidebar limitada)
 * - Não logado        → MenuButton     (sidebar user padrão)
 */

import { useEffect, useState } from "react";
import { authStorage } from "../services/storageAuth.js";
import MenuButtonAdm from "./MenuButtonAdm.jsx";
import MenuButton from "./MenuButton.jsx";

export default function MenuButtonAuto(props) {
  const [isAdmin, setIsAdmin] = useState(
    () => authStorage.hasAnyRole("ROLE_FUNCIONARIO", "ROLE_ADMIN"),
  );

  useEffect(() => {
    return authStorage.subscribe((snap) => {
      setIsAdmin(
        snap.roles?.includes("ROLE_FUNCIONARIO") ||
          snap.roles?.includes("ROLE_ADMIN") ||
          false,
      );
    });
  }, []);

  return isAdmin ? <MenuButtonAdm {...props} /> : <MenuButton {...props} />;
}
