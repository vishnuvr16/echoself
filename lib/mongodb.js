import mongoose from 'mongoose';

const MONGO_URL = 'mongodb+srv://vishnuvardhanr620_db_user:8IDN6a1uBdoqkni4@cluster0.641l4hy.mongodb.net/echoself?retryWrites=true&w=majority&appName=Cluster0'
const DB_NAME = process.env.DB_NAME || 'echoself';

if (!MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: DB_NAME,
      bufferCommands: false,
    };
    console.log("here")
    
    cached.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      console.log("connected")
      return mongoose;
    }).catch(err => {
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
