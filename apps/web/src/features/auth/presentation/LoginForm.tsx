"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button, Input } from "@repo/ui";

import { loginUser } from "../application/authService";
import { useAuth } from "./useAuth";

export function LoginForm() {
  const { setToken } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setIsSubmitting(true);
    try {
      const res = await loginUser({ email, password });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setToken(res.data.token);
      setSuccess("Login OK. Token guardado.");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Login</p>
        <p className="text-xs text-slate-500">POST /api/auth/login</p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        disabled={isSubmitting}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        variant="primary"
        state={isSubmitting ? "loading" : "default"}
        disabled={email.trim() === "" || password === ""}
      >
        Login
      </Button>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
    </form>
  );
}


