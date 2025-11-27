import { Schema, model, models, Document } from "mongoose";

// Interfaz TypeScript para el documento Event
export interface IEvent extends Document {
  title      : string;
  slug       : string;
  description: string;
  overview   : string;
  image      : string;
  venue      : string;
  location   : string;
  date       : string;
  time       : string;
  mode       : string;
  audience   : string;
  agenda     : string[];
  organizer  : string;
  tags       : string[];
  createdAt  : Date;
  updatedAt  : Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type     : String,
      required : [true, "El título es requerido"],
      trim     : true,
      maxlength: [100, "El título no puede exceder los 100 caracteres"],
    },
    slug: {
      type     : String,
      unique   : true,
      lowercase: true,
      trim     : true,
    },
    description: {
      type     : String,
      required : [true, "La descripción es requerida"],
      trim     : true,
      maxlength: [1000, "La descripción no puede exceder los 1000 caracteres"],
    },
    overview: {
      type     : String,
      required : [true, "El resumen es requerido"],
      trim     : true,
      maxlength: [500, "El resumen no puede exceder los 500 caracteres"],
    },
    image: {
      type    : String,
      required: [true, "La URL de la imagen es requerida"],
      trim    : true,
    },
    venue: {
      type    : String,
      required: [true, "El lugar es requerido"],
      trim    : true,
    },
    location: {
      type    : String,
      required: [true, "La ubicación es requerida"],
      trim    : true,
    },
    date: {
      type    : String,
      required: [true, "La fecha es requerida"],
    },
    time: {
      type    : String,
      required: [true, "La hora es requerida"],
    },
    mode: {
      type    : String,
      required: [true, "El modo es requerido"],
      enum    : {
        values : ["online", "offline", "hybrid"],
        message: "El modo debe ser online, offline o híbrido",
      },
    },
    audience: {
      type    : String,
      required: [true, "La audiencia es requerida"],
      trim    : true,
    },
    agenda: {
      type    : [String],
      required: [true, "La agenda es requerida"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message  : "Se requiere al menos un elemento en la agenda",
      },
    },
    organizer: {
      type    : String,
      required: [true, "El organizador es requerido"],
      trim    : true,
    },
    tags: {
      type    : [String],
      required: [true, "Las etiquetas son requeridas"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message  : "Se requiere al menos una etiqueta",
      },
    },
  },
  {
    timestamps: true, // Genera automáticamente createdAt y updatedAt
  }
);

// Hook pre-guardado para generación de slug y normalización de datos
EventSchema.pre("save", async function () {
  const event = this as IEvent;

  // Genera slug solo si el título cambió o el documento es nuevo
  if (event.isModified("title") || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  // Normaliza fecha a formato ISO si no lo está ya
  if (event.isModified("date")) {
    event.date = normalizeDate(event.date);
  }

  // Normaliza formato de hora (HH:MM)
  if (event.isModified("time")) {
    event.time = normalizeTime(event.time);
  }
});

// Función auxiliar para generar slug amigable para URL
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")// Elimina caracteres especiales
    .replace(/\s+/g, "-")        // Reemplaza espacios con guiones
    .replace(/-+/g, "-")         // Reemplaza múltiples guiones con un solo guion
    .replace(/^-|-$/g, "");      // Elimina guiones al inicio/final
}

// Función auxiliar para normalizar fecha a formato ISO
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Formato de fecha inválido");
  }
  return date.toISOString().split("T")[0];// Retorna formato YYYY-MM-DD
}

// Función auxiliar para normalizar formato de hora
function normalizeTime(timeString: string): string {
  // Maneja varios formatos de hora y convierte a HH:MM (formato 24 horas)
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match     = timeString.trim().match(timeRegex);

  if (!match) {
    throw new Error("Formato de hora inválido. Use HH:MM o HH:MM AM/PM");
  }

  let   hours   = parseInt(match[1]);
  const minutes = match[2];
  const period  = match[4]?.toUpperCase();

  if (period) {
    // Convierte formato 12 horas a formato 24 horas
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours  = 0;
  }

  if (
    hours < 0 ||
    hours > 23 ||
    parseInt(minutes) < 0 ||
    parseInt(minutes) > 59
  ) {
    throw new Error("Valores de hora inválidos");
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Crea índice único en slug para mejor rendimiento
EventSchema.index({ slug: 1 }, { unique: true });

// Crea índice compuesto para consultas comunes
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
