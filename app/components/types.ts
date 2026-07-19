export type AppointmentItem = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string | null;
  client: { name: string; phone?: string | null; email?: string | null };
  professional: { name: string };
  service: { name: string; duration: number; price: number | string };
};

export type UserSession = {
  name: string;
  role: "admin" | "barbero" | "cliente";
};

export const statusOptions = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

export const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export const roleLabels: Record<UserSession["role"], string> = {
  admin: "Administrador",
  barbero: "Barbero",
  cliente: "Cliente",
};
