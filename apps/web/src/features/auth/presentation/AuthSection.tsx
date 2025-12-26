"use client";

import { AuthStatus } from "./AuthStatus";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthSection() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Auth</h2>
        <p className="text-sm text-slate-600">Register / Login / Logout con JWT en localStorage.</p>
      </div>

      <AuthStatus />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RegisterForm />
        <LoginForm />
      </div>
    </section>
  );
}







