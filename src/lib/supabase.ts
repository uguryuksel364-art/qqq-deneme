import { createClient } from '@supabase/supabase-js';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';
export type TourType = 'full_day' | 'half_day';

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tour_date: string;
  tour_type: TourType;
  guests: number;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
}

export interface NewReservation {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  tour_date: string;
  tour_type: TourType;
  guests: number;
  notes?: string;
}

const rawUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  ''
).trim();

const rawAnonKey = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ''
).trim();

// Verify if valid Supabase credentials are provided
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your_supabase_project_url')
);

// Fallback dummy credentials to prevent createClient from throwing synchronously on startup
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

const supabaseUrl = isSupabaseConfigured ? rawUrl : fallbackUrl;
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : fallbackKey;

if (!isSupabaseConfigured) {
  console.info('[Supabase] Running in local fallback mode (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not configured).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to upload a base64 or file to Supabase Storage
 */
export async function uploadToSupabase(
  file: File | string,
  fileName: string,
  bucket: string = 'media'
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.warn('[Supabase] Upload skipped: Supabase storage is not configured.');
    return null;
  }

  try {
    let dataToUpload: File | Buffer | ArrayBuffer;

    if (typeof file === 'string' && file.startsWith('data:')) {
      // Convert base64 to blob
      const res = await fetch(file);
      dataToUpload = await res.arrayBuffer();
    } else {
      dataToUpload = file as File;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${Date.now()}-${fileName}`, dataToUpload, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}
