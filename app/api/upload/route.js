import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-side only
});

export async function POST() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // ⚡ Must match exactly what client sends
    const paramsToSign = {
      folder: "sokoni-products",
      timestamp,
      upload_preset: "market", // ✅ include preset here
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return new Response(
      JSON.stringify({
        timestamp,
        signature,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: "market",
        folder: "sokoni-products",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Signature error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Signature generation failed" }),
      { status: 500 }
    );
  }
}
