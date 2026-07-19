"use client";

import { useEffect, useMemo, useState } from "react";
import AgendaPanel from "./components/AgendaPanel";
import BookingForm from "./components/BookingForm";
import LoginPanel from "./components/LoginPanel";
import Sidebar from "./components/Sidebar";
import {
  roleLabels,
  statusLabels,
  statusOptions,
  type AppointmentItem,
  type UserSession,
} from "./components/types";

export default function Home() {
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    professionalName: "",
    serviceName: "",
    duration: "45",
    price: "50",
    startAt: "",
    endAt: "",
    notes: "",
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [professionalFilter, setProfessionalFilter] = useState("ALL");
  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>({});
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authForm, setAuthForm] = useState({ username: "admin", password: "admin123" });
  const [authLoading, setAuthLoading] = useState(false);
  const [activeView, setActiveView] = useState<"booking" | "agenda">("booking");

  const canManageAgenda = currentUser?.role === "admin" || currentUser?.role === "barbero";

  useEffect(() => {
    if (!currentUser) {
      setActiveView("booking");
      return;
    }

    if (canManageAgenda) {
      setActiveView("agenda");
    } else {
      setActiveView("booking");
    }
  }, [currentUser, canManageAgenda]);

  const summary = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((appointment) => appointment.status === "PENDING").length;
    const confirmed = appointments.filter((appointment) => appointment.status === "CONFIRMED").length;
    const completed = appointments.filter((appointment) => appointment.status === "COMPLETED").length;
    const cancelled = appointments.filter((appointment) => appointment.status === "CANCELLED").length;
    const revenue = appointments.reduce((accumulator, appointment) => {
      const price = Number(appointment.service.price);
      if (Number.isNaN(price)) {
        return accumulator;
      }

      return accumulator + price;
    }, 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue,
    };
  }, [appointments]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);

    try {
      const query = new URLSearchParams();

      if (dateFilter) {
        query.set("date", dateFilter);
      }

      if (statusFilter !== "ALL") {
        query.set("status", statusFilter);
      }

      if (professionalFilter !== "ALL") {
        query.set("professional", professionalFilter);
      }

      const response = await fetch(`/api/appointments${query.toString() ? `?${query}` : ""}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar las citas");
      }

      const appointmentList = data.appointments ?? [];
      setAppointments(appointmentList);
      setDraftStatuses(
        Object.fromEntries(
          appointmentList.map((appointment: AppointmentItem) => [
            appointment.id,
            appointment.status,
          ]),
        ),
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    void loadAppointments();

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (response.ok && data.user) {
          setCurrentUser(data.user);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    void loadSession();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAuthChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la cita");
      }

      setStatus("Cita creada correctamente.");
      setForm({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        professionalName: "",
        serviceName: "",
        duration: "45",
        price: "50",
        startAt: "",
        endAt: "",
        notes: "",
      });
      await loadAppointments();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar sesión");
      }

      setCurrentUser(data.user);
      setStatus(`Bienvenido ${data.user.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setStatus("Sesión cerrada.");
    } catch {
      setStatus("No se pudo cerrar la sesión.");
    }
  };

  const updateAppointmentStatus = async (appointmentId: string) => {
    const nextStatus = draftStatuses[appointmentId];

    if (!nextStatus) {
      return;
    }

    setUpdatingStatusId(appointmentId);
    setStatus("");

    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar la cita");
      }

      setStatus("Estado de la cita actualizado.");
      await loadAppointments();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-700 to-emerald-600 text-lg font-bold text-white">
                B
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Barbería
                </p>
                <h1 className="text-2xl font-bold text-zinc-900">BarberShop Control</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                {activeView === "booking" ? "Reserva" : "Administración"}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {currentUser ? roleLabels[currentUser.role] : "Sin sesión"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl bg-gradient-to-br from-sky-700 to-emerald-700 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
                Barbería
              </p>
              <h1 className="mt-2 text-2xl font-bold">Agenda de citas</h1>
              <p className="mt-2 text-sm text-sky-50">
                Reserva, gestiona y supervisa turnos desde un único dashboard.
              </p>
            </section>

            <LoginPanel
              currentUser={currentUser}
              authForm={authForm}
              authLoading={authLoading}
              onAuthChange={handleAuthChange}
              onLogin={handleLogin}
              onLogout={() => void handleLogout()}
            />

            <Sidebar
              activeView={activeView}
              canManageAgenda={canManageAgenda}
              onSelectBooking={() => setActiveView("booking")}
              onSelectAgenda={() => setActiveView("agenda")}
            />
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
                    Agenda mínima
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Reservá una cita</h2>
                </div>

                <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                  {currentUser ? `Sesión activa: ${roleLabels[currentUser.role]}` : "Sin sesión activa"}
                </div>
              </div>
            </section>

            {activeView === "booking" ? (
              <BookingForm
                form={form}
                loading={loading}
                status={status}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            ) : null}

            {activeView === "agenda" && canManageAgenda ? (
              <AgendaPanel
                summary={summary}
                appointments={appointments}
                dateFilter={dateFilter}
                statusFilter={statusFilter}
                professionalFilter={professionalFilter}
                draftStatuses={draftStatuses}
                updatingStatusId={updatingStatusId}
                loadingAppointments={loadingAppointments}
                onDateChange={setDateFilter}
                onStatusChange={setStatusFilter}
                onProfessionalChange={setProfessionalFilter}
                onRefresh={() => void loadAppointments()}
                onDraftStatusChange={(appointmentId, value) =>
                  setDraftStatuses((current) => ({
                    ...current,
                    [appointmentId]: value,
                  }))
                }
                onUpdateAppointmentStatus={(appointmentId) => void updateAppointmentStatus(appointmentId)}
              />
            ) : null}

            {currentUser && !canManageAgenda && activeView === "booking" ? (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                <h2 className="text-xl font-bold">Vista de cliente</h2>
                <p className="mt-2 text-zinc-600">
                  Tu sesión está activa como cliente. Puedes reservar citas, pero el panel administrativo queda reservado para el equipo.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
