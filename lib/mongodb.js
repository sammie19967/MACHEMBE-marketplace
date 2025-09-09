// lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI in .env.local');
}

// simple global cache for dev to avoid multiple connections
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // optional mongoose settings
      bufferCommands: false,
      // useNewUrlParser: true, useUnifiedTopology: true
    }).then((m) => {
      console.log('MongoDB connected successfully');
      return m;
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;