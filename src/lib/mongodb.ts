import mongoose from "mongoose";

// Define el tipo de caché de conexión
type MongooseCache = {
  conn   : typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extender el objeto global para incluir nuestro caché de mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Inicializar el caché en el objeto global para persistir entre recargas en caliente durante el desarrollo
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establece una conexión a MongoDB usando Mongoose.
 * Almacena en caché la conexión para evitar múltiples conexiones durante las recargas en caliente del desarrollo.
 * @returns Promise que resuelve a la instancia de Mongoose
 */
async function connectDB(): Promise<typeof mongoose> {
  // Devolver la conexión existente si está disponible
  if (cached.conn) {
    return cached.conn;
  }

  // Devolver la promesa de conexión existente si hay una en progreso
  if (!cached.promise) {
    // Validar que existe la URI de MongoDB
    if (!MONGODB_URI) {
      throw new Error(
        "Por favor define la variable de entorno MONGODB_URI dentro de .env.local"
      );
    }
    const options = {
      bufferCommands: false, // Deshabilitar el buffering de Mongoose
    };

    // Crear una nueva promesa de conexión
    cached.promise = mongoose.connect(MONGODB_URI!, options)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    // Esperar a que se establezca la conexión
    cached.conn = await cached.promise;
  } catch (error) {
    // Reiniciar la promesa en caso de error para permitir reintentos
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
