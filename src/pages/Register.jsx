import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";
import GameLayout from "../layouts/GameLayout";
import Card from "../components/Card";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !gmail.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          gmail,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error("REGISTER FETCH ERROR:", err);
      setError("Cannot connect to backend server.");
    }
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6">
          Create Account
        </h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            />

            <input
              type="email"
              placeholder="Gmail"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </Card>
      </div>
    </GameLayout>
  );
}

export default Register;