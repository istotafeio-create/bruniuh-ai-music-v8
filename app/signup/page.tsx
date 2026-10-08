"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const supabase = createBrowserSupabase();

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            window.location.origin + "/studio/create",
        },
      });

      if (error) {
        setMessage(error.message);
      } else if (!data.session) {
        setMessage(
          "Conta criada. Confirma o email e depois entra."
        );
      } else {
        window.location.href = "/studio/create";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="authVisual">
        <Brand />

        <div className="authVisualText">
          <span className="landingBadge">
            BRUNIUHMUSIC AI MUSIC
          </span>

          <h1>
            Music creation.
            <br />
            <span>Organized like a real studio.</span>
          </h1>

          <p>
            Cria, guarda, explora e gere tudo em áreas separadas.
          </p>
        </div>
      </div>

      <section className="authPanel">
        <div className="authPanelInner">
          <span className="eyebrow">SECURE ACCESS</span>

          <h2>Create your account</h2>

          <p>
            Entra no teu BRUNIUHMUSIC AI MUSIC Studio.
          </p>

          <form onSubmit={submit}>
            <label>Email</label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>

            <input
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="btn primary full"
              disabled={loading}
            >
              {loading ? "PLEASE WAIT…" : "CREATE ACCOUNT"}
            </button>
          </form>

          {message && (
            <div className="formMessage">{message}</div>
          )}

          <div className="authAlt">
            Já tens conta? <Link href="/login">Log in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}