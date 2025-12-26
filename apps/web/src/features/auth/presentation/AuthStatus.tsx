"use client";

import { useAuth } from "./useAuth";

export function AuthStatus() {
  const { status, token, logout } = useAuth();

  const tokenPreview = typeof token === "string" ? `${token.slice(0, 16)}…` : "";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Autenticación</p>
          <p className="text-xs text-slate-600">
            Estado:{" "}
            <span className={status === "authenticated" ? "text-emerald-700" : status === "anonymous" ? "text-slate-700" : "text-slate-500"}>
              {status === "authenticated" ? "logueado" : status === "anonymous" ? "deslogueado" : "cargando"}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={logout}
          disabled={status !== "authenticated"}
        >
          Logout
        </button>
      </div>

      {status === "authenticated" && (
        <p className="text-xs text-slate-600">
          Token: <span className="font-mono">{tokenPreview}</span>
        </p>
      )}

      <p className="text-xs text-slate-500">
        JWT se guarda en <span className="font-mono">localStorage</span> bajo la key{" "}
        <span className="font-mono">auth_token</span>.
      </p>
    </div>
  );
}







