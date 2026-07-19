'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Algo salió mal</h2>
          <p className="text-sm text-zinc-600 mb-6">
            Ocurrió un error inesperado. Por favor, intentá de nuevo.
          </p>
          <button
            onClick={() => unstable_retry()}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}