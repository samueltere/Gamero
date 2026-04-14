const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured() {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadToCloudinary(file: File, folder: string) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.');
  }

  return {
    duration: typeof payload.duration === 'number' ? Math.round(payload.duration) : 0,
    publicId: String(payload.public_id || ''),
    secureUrl: String(payload.secure_url || ''),
  };
}
