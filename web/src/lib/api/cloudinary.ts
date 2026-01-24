// web/src/lib/api/cloudinary.ts
// Adapté du mobile (api/cloudinary.ts) pour le web

interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    error?: {
        message: string;
    };
}

/**
 * Upload une image vers Cloudinary depuis le navigateur
 * @param file - Fichier image (File ou Blob)
 * @returns URL sécurisée de l'image uploadée ou null en cas d'erreur
 */
export const uploadImageToCloudinary = async (
    file: File | Blob
): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(
            'upload_preset',
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nextjs_upload'
        );

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const res = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const json: CloudinaryUploadResponse = await res.json();

        if (!res.ok) {
            throw new Error(json.error?.message || "Erreur lors de l'upload");
        }

        return json.secure_url;
    } catch (error: any) {
        console.error('❌ Cloudinary Web Upload Error:', error.message);
        return null;
    }
};

/**
 * Upload une image depuis une URL de données (base64)
 * @param dataUrl - URL de données base64 de l'image
 * @returns URL sécurisée de l'image uploadée ou null en cas d'erreur
 */
export const uploadBase64ToCloudinary = async (
    dataUrl: string
): Promise<string | null> => {
    try {
        // Convertir base64 en Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        return uploadImageToCloudinary(blob);
    } catch (error: any) {
        console.error('❌ Cloudinary Base64 Upload Error:', error.message);
        return null;
    }
};

/**
 * Compresser une image côté client avant upload
 * @param file - Fichier image original
 * @param maxWidth - Largeur maximale (défaut 1920px)
 * @param quality - Qualité de compression 0-1 (défaut 0.7)
 * @returns Blob compressé
 */
export const compressImage = async (
    file: File,
    maxWidth = 1920,
    quality = 0.7
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Calculer les nouvelles dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                'image/jpeg',
                quality
            );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Upload une image avec compression automatique
 * @param file - Fichier image original
 * @returns URL sécurisée de l'image uploadée ou null en cas d'erreur
 */
export const uploadCompressedImageToCloudinary = async (
    file: File
): Promise<string | null> => {
    try {
        const compressed = await compressImage(file);
        return uploadImageToCloudinary(compressed);
    } catch (error: any) {
        console.error('❌ Cloudinary Compressed Upload Error:', error.message);
        return null;
    }
};
