import { NextRequest, NextResponse } from "next/server";

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json( { message: "Parámetro slug inválido o faltante" }, { status: 400 });
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    if (!event) {
      return NextResponse.json({ message: `Evento con slug '${sanitizedSlug}' no encontrado` }, { status: 404 });
    }

    return NextResponse.json({ message: "Evento obtenido exitosamente", event }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error al obtener eventos por slug:", error);
    }

    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json( { message: "Error de configuración de base de datos", status: 500 } );
      }

      return NextResponse.json({ message: "Error al obtener eventos", error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Ocurrió un error inesperado" }, { status: 500 });
  }
}
