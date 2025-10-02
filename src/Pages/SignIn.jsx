// src/pages/SignIn.jsx  (excerpt)
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);

  const from = location.state?.from || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: do real auth request here and get user/role
    const fakeUser = { id: 1, name: "John", email: "john@example.com" };
    signIn(fakeUser, "user");        // or "admin"/"host" from backend
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* your inputs */}
      <button type="submit">Sign in</button>
    </form>
  );
}
