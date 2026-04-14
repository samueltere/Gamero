const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured() {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadToCloudinary(file: File, folder: string) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const resourceTypes = getResourceTypes(file);
  let lastError = 'Cloudinary upload failed.';

  for (const resourceType of resourceTypes) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('tags', buildTagList(folder));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    const payload = await parsePayload(response);

    if (response.ok) {
      return {
        duration: typeof payload.duration === 'number' ? Math.round(payload.duration) : 0,
        publicId: String(payload.public_id || ''),
        secureUrl: String(payload.secure_url || ''),
      };
    }

    lastError = getCloudinaryErrorMessage(payload, response.statusText);
  }

  throw new Error(lastError);
}

function getResourceTypes(file: File) {
  if (file.type.startsWith('image/')) {
    return ['image'];
  }

  if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
    return ['video', 'raw', 'auto'];
  }

  return ['raw', 'auto'];
}

async function parsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

function getCloudinaryErrorMessage(payload: Record<string, unknown>, fallback: string) {
  const error = payload.error;

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return fallback || 'Cloudinary upload failed.';
}

function buildTagList(folder: string) {
  return folder
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join(',');
}
