import { NextResponse } from "next/server";

const seededUsers = {
  admin: {
    name: "Administrador",
    role: "admin",
    password: "admin123",
  },
  barbero: {
    name: "Barbero",
    role: "barbero",
    password: "barbero123",
  },
  cliente: {
    name: "Cliente",
    role: "cliente",
    password: "cliente123",
  },
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const matchedUser = seededUsers[username as keyof typeof seededUsers];

    if (!matchedUser || matchedUser.password !== password) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: matchedUser.name,
        role: matchedUser.role,
      },
    });

    response.cookies.set("barbershop_session", JSON.stringify({
      name: matchedUser.name,
      role: matchedUser.role,
    }), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión" },
      { status: 500 },
    );
  }
}
