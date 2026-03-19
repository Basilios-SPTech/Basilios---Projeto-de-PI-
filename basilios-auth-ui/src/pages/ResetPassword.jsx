import { useNavigate, useSearchParams } from "react-router-dom";
import ResetPasswordForm from "../components/forms/ResetPasswordForm.jsx";
import MenuButtonAuto from "../components/MenuButtonAuto.jsx";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <>
      <MenuButtonAuto />
      <ResetPasswordForm
        token={token}
        onGoLogin={() => navigate("/login")}
      />
    </>
  );
}
