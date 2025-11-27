import Event from "./event.model";
import { Schema, model, models, Document, Types } from "mongoose";

// Interfaz TypeScript para el documento de Reserva
export interface IBooking extends Document {
  eventId  : Types.ObjectId;
  email    : string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type    : Schema.Types.ObjectId,
      ref     : "Event",
      required: [true, "El ID del evento es requerido"],
    },
    email: {
      type     : String,
      required : [true, "El email es requerido"],
      trim     : true,
      lowercase: true,
      validate : {
        validator: function (email: string) {
          // Regex de validación de email compatible con RFC 5322
          const emailRegex = 
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: "Por favor proporciona una dirección de email válida",
      },
    },
  },
  {
    timestamps: true, // Generar automáticamente createdAt y updatedAt
  }
);

  // Hook pre-guardado para validar que el evento existe antes de crear la reserva
BookingSchema.pre("save", async function (next) {
  const booking = this as IBooking;

  // Solo validar eventId si es nuevo o ha sido modificado
  if (booking.isModified("eventId") || booking.isNew) {
    try {
      const eventExists = await Event.findById(booking.eventId).select("_id");

      if (!eventExists) {
        const error = new Error(
          `El evento con ID ${booking.eventId} no existe`
        );
        error.name = "ValidationError";
        return next(error);
      }
    } catch {
      const validationError = new Error(
        "Formato de ID de evento inválido o error de base de datos"
      );
      validationError.name = "ValidationError";
      return next(validationError);
    }
  }

  next();
});

// Crear índice en eventId para consultas más rápidas
BookingSchema.index({ eventId: 1 });

// Crear índice compuesto para consultas comunes (reservas de eventos por fecha)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Crear índice en email para búsquedas de reservas de usuario
BookingSchema.index({ email: 1 });

// Forzar una reserva por evento por email
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
