import { statusLabels, statusOptions, type AppointmentItem } from "./types";

type AgendaSummary = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
};

type AgendaPanelProps = {
  summary: AgendaSummary;
  appointments: AppointmentItem[];
  dateFilter: string;
  statusFilter: string;
  professionalFilter: string;
  draftStatuses: Record<string, string>;
  updatingStatusId: string | null;
  loadingAppointments: boolean;
  onDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProfessionalChange: (value: string) => void;
  onRefresh: () => void;
  onDraftStatusChange: (appointmentId: string, value: string) => void;
  onUpdateAppointmentStatus: (appointmentId: string) => void;
};

export default function AgendaPanel({
  summary,
  appointments,
  dateFilter,
  statusFilter,
  professionalFilter,
  draftStatuses,
  updatingStatusId,
  loadingAppointments,
  onDateChange,
  onStatusChange,
  onProfessionalChange,
  onRefresh,
  onDraftStatusChange,
  onUpdateAppointmentStatus,
}: AgendaPanelProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <p className="text-sm font-semibold text-amber-700">Panel administrativo</p>
        <p className="mt-1 text-sm text-amber-900">
          Resume el día, filtra citas y actualiza estados con una sola vista de control.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{summary.total}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendientes</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{summary.pending}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Confirmadas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{summary.confirmed}</p>
        </div>
        <div className="rounded-xl bg-cyan-50 p-4 ring-1 ring-cyan-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Completadas</p>
          <p className="mt-2 text-2xl font-bold text-cyan-900">{summary.completed}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Ingresos</p>
          <p className="mt-2 text-2xl font-bold text-rose-900">${summary.revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
            Agenda administrativa
          </p>
          <h2 className="mt-1 text-2xl font-bold">Agenda por fecha y estado</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Fecha
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => onDateChange(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Estado
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="ALL">Todos</option>
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusLabels[statusOption]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Barbero
            <select
              value={professionalFilter}
              onChange={(event) => onProfessionalChange(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="ALL">Todos</option>
              {Array.from(new Set(appointments.map((appointment) => appointment.professional.name))).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      {loadingAppointments ? (
        <p className="text-sm text-zinc-600">Cargando agenda...</p>
      ) : appointments.length === 0 ? (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
          Aún no hay citas creadas.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] gap-3 bg-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <span>Cliente</span>
            <span>Profesional</span>
            <span>Horario</span>
            <span>Servicio</span>
            <span>Estado</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-zinc-900">{appointment.client.name}</p>
                  <p className="text-zinc-500">
                    {appointment.client.phone || appointment.client.email || "Sin contacto"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-zinc-800">{appointment.professional.name}</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-800">
                    {new Date(appointment.startAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-zinc-500">{appointment.service.duration} min</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-800">{appointment.service.name}</p>
                  <p className="text-zinc-500">${Number(appointment.service.price).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <select
                    value={draftStatuses[appointment.id] ?? appointment.status}
                    onChange={(event) => onDraftStatusChange(appointment.id, event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  >
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusLabels[statusOption]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onUpdateAppointmentStatus(appointment.id)}
                    disabled={updatingStatusId === appointment.id}
                    className="w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                  >
                    {updatingStatusId === appointment.id ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
