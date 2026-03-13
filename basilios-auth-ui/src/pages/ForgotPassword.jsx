import { useNavigate, useSearchParams } from "react-router-dom";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm.jsx";
import MenuButtonAuto from "../components/MenuButtonAuto.jsx";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  return (
    <>
      <MenuButtonAuto />
      <ForgotPasswordForm
        initialEmail={initialEmail}
        onGoLogin={() => navigate("/login")}
      />
    </>
  );
}
