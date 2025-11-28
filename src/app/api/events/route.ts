import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json({ message: "Error al procesar los datos del formulario" }, { status: 400 });
    }

    const file = formData.get("image") as File;

    if (!file) return NextResponse.json({ message: "No se proporcionó ninguna imagen" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image", folder: "DevEvent" }, (error, results) => {
        if (error) return reject(error);

        resolve(results);
      }).end(buffer);
    })

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      { message: "Evento creado exitosamente", event: createdEvent },
      { status: 201 }
    );

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error instanceof Error ? error.message : "Unknown" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json({message: "Eventos obtenidos exitosamente", events }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor", error: error instanceof Error ? error.message : "Unknown" }, 
      { status: 500 }
    );
  }  
}
