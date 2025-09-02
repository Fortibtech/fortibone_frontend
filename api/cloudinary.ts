// src/api/cloudinary.ts
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export const uploadImageToCloudinary = async (
  uri: string
): Promise<string | null> => {
  try {
    // 1️⃣ Compression et redimensionnement
    const compressedUri = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2️⃣ Préparation du FormData
    const filename = compressedUri.uri.split("/").pop() || "image.jpg";
    const type = "image/jpeg"; // format forcé par le manipulator

    const formData = new FormData();
    formData.append("file", {
      uri: compressedUri.uri,
      name: filename,
      type,
    } as any);

    formData.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET || "nextjs_upload"
    );

    // 3️⃣ Upload vers Cloudinary
    const uploadUrl =
      process.env.CLOUDINARY_URL ||
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload";

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const json: CloudinaryUploadResponse & { error?: any } = await res.json();

    if (!res.ok) {
      throw new Error(json.error?.message || "Erreur lors de l'upload");
    }

    return json.secure_url;
  } catch (error: any) {
    console.error("❌ Cloudinary Mobile Upload Error:", error.message);
    Alert.alert("Erreur", error.message || "Impossible de téléverser l'image");
    return null;
  }
};
