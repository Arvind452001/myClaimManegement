import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await authAPI.login(email, password);
    navigate("/");
  } catch (err: any) {
    setError(
      err?.response?.data?.message ||
      err?.message ||
      "An error occurred during login"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: "100%", maxWidth: 420 }}>
        <div className="card-body p-4">
          <h2 className="h4 text-center mb-4">Login</h2>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
