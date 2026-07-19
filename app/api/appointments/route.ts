import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

type AppointmentStatusValue = (typeof allowedStatuses)[number];
type SessionUser = {
  name: string;
  role: "admin" | "barbero" | "cliente";
};

async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("barbershop_session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie) as SessionUser;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const professional = searchParams.get("professional");

    const where: Prisma.AppointmentWhereInput = {};

    if (date) {
      const selectedDate = new Date(`${date}T00:00:00`);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      where.startAt = {
        gte: selectedDate,
        lt: nextDay,
      };
    }

    if (status && allowedStatuses.includes(status as AppointmentStatusValue)) {
      where.status = status as AppointmentStatusValue;
    }

    if (professional) {
      where.professional = {
        is: {
          name: professional,
        },
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: {
        startAt: "asc",
      },
      include: {
        client: true,
        professional: true,
        service: true,
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron obtener las citas" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para administrar citas" },
        { status: 401 },
      );
    }

    if (currentUser.role !== "admin" && currentUser.role !== "barbero") {
      return NextResponse.json(
        { error: "No tienes permisos para administrar citas" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { id, status, startAt, endAt, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "La cita es obligatoria para actualizar" },
        { status: 400 },
      );
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "No existe la cita indicada" },
        { status: 404 },
      );
    }

    const nextStatus = status && allowedStatuses.includes(status as AppointmentStatusValue)
      ? (status as AppointmentStatusValue)
      : undefined;

    const nextStartAt = startAt ? new Date(startAt) : existingAppointment.startAt;
    const nextEndAt = endAt ? new Date(endAt) : existingAppointment.endAt;

    if (nextStartAt >= nextEndAt) {
      return NextResponse.json(
        { error: "La hora de fin debe ser posterior a la de inicio" },
        { status: 400 },
      );
    }

    // Skip overlap check if the appointment is being cancelled
    if (nextStatus !== "CANCELLED") {
      const overlappingAppointment = await prisma.appointment.findFirst({
        where: {
          id: {
            not: id,
          },
          professionalId: existingAppointment.professionalId,
          status: {
            not: "CANCELLED",
          },
          startAt: {
            lt: nextEndAt,
          },
          endAt: {
            gt: nextStartAt,
          },
        },
      });

      if (overlappingAppointment) {
        return NextResponse.json(
          { error: "Ese profesional ya tiene una cita en ese horario" },
          { status: 409 },
        );
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(startAt ? { startAt: nextStartAt } : {}),
        ...(endAt ? { endAt: nextEndAt } : {}),
        ...(typeof notes === "string" ? { notes: notes || null } : {}),
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo actualizar la cita" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clientName,
      clientPhone,
      clientEmail,
      professionalName,
      serviceName,
      duration,
      price,
      startAt,
      endAt,
      notes,
    } = body;

    if (!clientName || !professionalName || !serviceName || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const client = await prisma.client.create({
      data: {
        name: clientName,
        phone: clientPhone || null,
        email: clientEmail?.trim() || null,
      },
    });

    let professional = await prisma.professional.findFirst({
      where: { name: professionalName },
    });

    if (!professional) {
      professional = await prisma.professional.create({
        data: { name: professionalName },
      });
    }

    let service = await prisma.service.findFirst({
      where: { name: serviceName },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceName,
          duration: Number(duration) || 45,
          price: new Prisma.Decimal(price ?? 0),
        },
      });
    }

    const appointmentStart = new Date(startAt);
    const appointmentEnd = new Date(endAt);

    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId: professional.id,
        status: {
          not: "CANCELLED",
        },
        startAt: {
          lt: appointmentEnd,
        },
        endAt: {
          gt: appointmentStart,
        },
      },
    });

    if (overlappingAppointment) {
      return NextResponse.json(
        { error: "Ese profesional ya tiene una cita en ese horario" },
        { status: 409 },
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        professionalId: professional.id,
        serviceId: service.id,
        startAt: appointmentStart,
        endAt: appointmentEnd,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo crear la cita" },
      { status: 500 },
    );
  }
}
