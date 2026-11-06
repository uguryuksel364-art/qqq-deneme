import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const NEW_CLOUD_NAME = 'oyzz6k3g';
const NEW_API_KEY = '149625381367896';
const NEW_API_SECRET = 'uHvRN9X0-jrt3183G_rYW1tsRAs';

export const getCloudinaryConfig = () => {
  const envCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const isOldCloud = !envCloud || envCloud === 'lz8h48nw' || envCloud.includes('your_');
  const cloud_name = isOldCloud ? NEW_CLOUD_NAME : envCloud;

  const envKey = process.env.CLOUDINARY_API_KEY;
  const isOldKey = !envKey || envKey.includes('your_') || isOldCloud || envKey === '471241731763684';
  const api_key = isOldKey ? NEW_API_KEY : envKey;

  const envSecret = process.env.CLOUDINARY_API_SECRET;
  const isOldSecret = !envSecret || envSecret.includes('your_') || isOldCloud || envSecret.startsWith('_jYFt');
  const api_secret = isOldSecret ? NEW_API_SECRET : envSecret;

  // Sync process.env so that the entire Node environment reflects the active new credentials
  process.env.CLOUDINARY_CLOUD_NAME = cloud_name;
  process.env.CLOUDINARY_API_KEY = api_key;
  process.env.CLOUDINARY_API_SECRET = api_secret;
  process.env.CLOUDINARY_URL = `cloudinary://${api_key}:${api_secret}@${cloud_name}`;

  return { cloud_name, api_key, api_secret, secure: true };
};

// Check if Cloudinary credentials are validly provided
export const checkIsCloudinaryConfigured = (): boolean => {
  const conf = getCloudinaryConfig();
  return Boolean(conf.cloud_name && conf.api_key && conf.api_secret);
};

export const isCloudinaryConfigured = checkIsCloudinaryConfigured();

// Auto-configure Cloudinary instance
cloudinary.config(getCloudinaryConfig());

/**
 * Ping Cloudinary to verify connection status
 */
export async function pingCloudinary(): Promise<boolean> {
  try {
    if (!checkIsCloudinaryConfigured()) return false;
    cloudinary.config(getCloudinaryConfig());
    const res = await cloudinary.api.ping();
    return res.status === 'ok';
  } catch (err) {
    console.warn('Cloudinary ping failed:', err);
    return false;
  }
}

/**
 * Upload a local file path or base64 data to Cloudinary
 */
export async function uploadToCloudinary(
  fileSource: string,
  options: {
    folder?: string;
    resource_type?: 'auto' | 'image' | 'video' | 'raw';
    public_id?: string;
  } = {}
): Promise<{ url: string; secure_url: string; public_id: string; duration?: number; bytes?: number } | null> {
  if (!checkIsCloudinaryConfigured()) {
    return null;
  }

  // Ensure config is fresh with new credentials
  cloudinary.config(getCloudinaryConfig());

  try {
    const result = await cloudinary.uploader.upload(fileSource, {
      folder: options.folder || 'mert_vip_transfer',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      overwrite: true,
    });

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      bytes: result.bytes,
    };
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}

export { cloudinary };
