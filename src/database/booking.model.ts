import Event from "./event.model";
import { Schema, model, models, Document, Types, HydratedDocument } from "mongoose";

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
    timestamps: true,
  }
);

// Hook pre-guardado para validar que el evento existe antes de crear la reserva
BookingSchema.pre<HydratedDocument<IBooking>>("save", async function () {
  // Solo validar eventId si es nuevo o ha sido modificado
  if (this.isModified("eventId") || this.isNew) {
    try {
      const eventExists = await Event.findById(this.eventId).select("_id");

      if (!eventExists) {
        throw new Error(`El evento con ID ${this.eventId} no existe`);
      }
    } catch (error) {
      if (error instanceof Error) {
        const validationError = new Error(
          error.message || "Formato de ID de evento inválido o error de base de datos"
        );
        validationError.name = "ValidationError";
        throw validationError;
      }
      throw new Error("Error de validación desconocido");
    }
  }
});

// Crear índice en eventId para consultas más rápidas
BookingSchema.index({ eventId: 1 });

// Crear índice compuesto para consultas comunes (reservas de eventos por fecha)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Crear índice en email para búsquedas de reservas de usuario
BookingSchema.index({ email: 1 });

// Forzar una reserva por evento por email
BookingSchema.index(
  { eventId: 1   , email: 1 },
  { unique : true, name : "uniq_event_email" }
);

const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
