import { roleLabels, type UserSession } from "./types";

type LoginPanelProps = {
  currentUser: UserSession | null;
  authForm: { username: string; password: string };
  authLoading: boolean;
  onAuthChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
};

export default function LoginPanel({
  currentUser,
  authForm,
  authLoading,
  onAuthChange,
  onLogin,
  onLogout,
}: LoginPanelProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
        Acceso al sistema
      </p>

      {currentUser ? (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <p className="text-sm font-semibold text-zinc-900">{currentUser.name}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {roleLabels[currentUser.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={onLogin} className="mt-3 space-y-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Usuario
            <input
              name="username"
              value={authForm.username}
              onChange={onAuthChange}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Contraseña
            <input
              name="password"
              type="password"
              value={authForm.password}
              onChange={onAuthChange}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {authLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      )}

      <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 ring-1 ring-zinc-200">
        Usuarios de prueba: <strong>admin / admin123</strong>, <strong>barbero / barbero123</strong>, <strong>cliente / cliente123</strong>
      </div>
    </section>
  );
}
