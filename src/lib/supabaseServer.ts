import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Server-side Supabase client
// This uses the SUPABASE_SECRET_KEY which should have service_role permissions
// to bypass RLS for administrative tasks in the background server.

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

// Verify configuration
export const isSupabaseServerConfigured = Boolean(
  supabaseUrl && 
  supabaseSecretKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseSecretKey.includes('YOUR_ACTUAL_SECRET_KEY')
);

if (!isSupabaseServerConfigured && process.env.NODE_ENV !== 'production') {
  console.info('[Supabase Server] Secret key not configured. Server-side Supabase features will be disabled.');
}

// Fallback dummy credentials to prevent error on startup
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabaseServer = createClient(
  isSupabaseServerConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseServerConfigured ? supabaseSecretKey : fallbackKey
);

/**
 * Upload a local file to Supabase Storage bucket
 */
export async function uploadFileToSupabaseStorage(
  filePath: string,
  destinationPath: string,
  bucket: string = 'media'
): Promise<string | null> {
  if (!isSupabaseServerConfigured) return null;
  try {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .upload(destinationPath, fileBuffer, {
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Storage] Upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('[Supabase Storage] Upload exception:', err);
    return null;
  }
}

