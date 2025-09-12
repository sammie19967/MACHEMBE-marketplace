import { useState } from "react";

export default function useCloudinaryUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Ask backend for signature
      const sigRes = await fetch("/api/upload", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get signature");
      const { timestamp, signature, apiKey, cloudName, uploadPreset, folder } =
        await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
formData.append("api_key", apiKey);
formData.append("timestamp", timestamp);
formData.append("signature", signature);
formData.append("upload_preset", uploadPreset); // 👈 must match
formData.append("folder", folder);


      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error?.message || "Upload failed");

      return data;
    } finally {
      setLoading(false);
    }
  };

  const uploadMultipleFiles = async (files) => {
    return Promise.all(files.map(uploadFile));
  };

  return { uploadFile, uploadMultipleFiles, loading, error };
}
