import type { ChangeEvent, FormEvent } from "react";

type BookingFormProps = {
  form: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    professionalName: string;
    serviceName: string;
    duration: string;
    price: string;
    startAt: string;
    endAt: string;
    notes: string;
  };
  loading: boolean;
  status: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BookingForm({
  form,
  loading,
  status,
  onChange,
  onSubmit,
}: BookingFormProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-4 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <p className="text-sm font-semibold text-emerald-700">Formulario de reserva</p>
        <p className="mt-1 text-sm text-emerald-900">
          Crea citas nuevas y lleva el flujo del cliente en una sola pantalla limpia.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nombre del cliente
          <input
            name="clientName"
            value={form.clientName}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Teléfono
          <input
            name="clientPhone"
            value={form.clientPhone}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="clientEmail"
            type="email"
            value={form.clientEmail}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Profesional
          <input
            name="professionalName"
            value={form.professionalName}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Servicio
          <input
            name="serviceName"
            value={form.serviceName}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Duración (min)
          <input
            name="duration"
            type="number"
            value={form.duration}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Precio
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Inicio
          <input
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Fin
          <input
            name="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={onChange}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
          Nota
          <textarea
            name="notes"
            value={form.notes}
            onChange={onChange}
            className="min-h-24 rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear cita"}
          </button>

          {status ? <p className="mt-3 text-sm text-zinc-700">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}
