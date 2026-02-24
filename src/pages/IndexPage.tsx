import React, { useState } from "react";

export default function IndexPage(): JSX.Element {
  const [email, setEmail] = useState<string>("admin@example.com");
  const [password, setPassword] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { email, password };

    // hook: call your login API here
    // example: await signIn(email, password)
    // console.log("Login payload:", payload);
  };

  return (
    <>
      <div className="login-card card shadow-sm">
        <div className="card-body">
          <div className="text-center mb-3">
            <img alt="logo" src="assets/images/logo.png" style={{ width: 220 }} />
          </div>

          <h5 className="card-title text-center">Login</h5>

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                placeholder="••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="d-grid mt-5">
              <button className="btn btn-primary" type="submit" disabled={!email.trim() || !password.trim()}>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OPTIONAL: keep your existing styling structure */}
      <style>{`
        .login-card {
          max-width: 420px;
          margin: 60px auto;
          border-radius: 12px;
        }
      `}</style>
    </>
  );
}
