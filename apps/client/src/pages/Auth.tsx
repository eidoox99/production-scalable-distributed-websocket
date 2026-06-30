import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, setToken } from "../lib/auth";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    try {
      const data = await login(email, password);
      setToken(data.accessToken);
      navigate("/listen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
    }
  }

  async function handleRegister() {
    setError("");
    try {
      const data = await register(email, password);
      setToken(data.accessToken);
      navigate("/listen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "register failed");
    }
  }

  return (
    <div>
      <h1>auth</h1>
      <div>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button type="button" onClick={handleLogin}>
          login
        </button>
        <button type="button" onClick={handleRegister}>
          register
        </button>
      </div>
      {error && <p>{error}</p>}
    </div>
  );
}
