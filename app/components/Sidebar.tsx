type SidebarProps = {
  activeView: "booking" | "agenda";
  canManageAgenda: boolean;
  onSelectBooking: () => void;
  onSelectAgenda: () => void;
};

export default function Sidebar({
  activeView,
  canManageAgenda,
  onSelectBooking,
  onSelectAgenda,
}: SidebarProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
        Navegación
      </p>
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={onSelectBooking}
          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-left ${
            activeView === "booking"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-zinc-50 text-zinc-700"
          }`}
        >
          Reserva
        </button>

        {canManageAgenda ? (
          <button
            type="button"
            onClick={onSelectAgenda}
            className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-left ${
              activeView === "agenda"
                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                : "bg-zinc-50 text-zinc-700"
            }`}
          >
            Administración
          </button>
        ) : null}
      </div>
    </section>
  );
}
