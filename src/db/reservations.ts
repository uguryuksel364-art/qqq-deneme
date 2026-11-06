import { readJsonFile, writeJsonFile } from './local-db-util';
import { supabaseServer, isSupabaseServerConfigured } from '../lib/supabaseServer';

export interface ReservationRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tourDate: string;
  tourType: string;
  guests: number;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface NewReservationInput {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  tourDate: string;
  tourType: string;
  guests: number;
  notes?: string | null;
}

const FILENAME = 'reservations.json';

export async function fetchAllReservations() {
  if (isSupabaseServerConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name || ''),
          phone: String(r.phone || ''),
          email: r.email ? String(r.email) : undefined,
          tourDate: String(r.tour_date || ''),
          tourType: String(r.tour_type || ''),
          guests: r.guests,
          notes: r.notes,
          status: r.status,
          createdAt: r.created_at,
        })) as ReservationRecord[];
      }
      console.warn('[Supabase Server] Fetch error:', error);
    } catch (err) {
      console.error('[Supabase Server] Fetch exception:', err);
    }
  }

  // Fallback to local JSON
  const data = readJsonFile<ReservationRecord[]>(FILENAME, []);
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function insertReservation(data: NewReservationInput) {
  const newRes: ReservationRecord = {
    id: data.id || `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    tourDate: data.tourDate,
    tourType: data.tourType,
    guests: data.guests,
    notes: data.notes || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured) {
    try {
      const { error } = await supabaseServer.from('reservations').insert([{
        id: data.id, // Supabase can generate if null, but we pass it if we have it
        name: data.name,
        phone: data.phone,
        email: data.email,
        tour_date: data.tourDate,
        tour_type: data.tourType,
        guests: data.guests,
        notes: data.notes,
        status: 'pending',
      }]);
      
      if (error) console.warn('[Supabase Server] Insert error:', error);
    } catch (err) {
      console.error('[Supabase Server] Insert exception:', err);
    }
  }

  // Always mirror to local storage
  const reservations = readJsonFile<ReservationRecord[]>(FILENAME, []);
  reservations.push(newRes);
  writeJsonFile(FILENAME, reservations);
  return newRes;
}

export async function updateReservationStatus(id: string, status: string) {
  if (isSupabaseServerConfigured) {
    try {
      const { error } = await supabaseServer
        .from('reservations')
        .update({ status })
        .eq('id', id);
      
      if (error) console.warn('[Supabase Server] Update error:', error);
    } catch (err) {
      console.error('[Supabase Server] Update exception:', err);
    }
  }

  const reservations = readJsonFile<ReservationRecord[]>(FILENAME, []);
  const index = reservations.findIndex((r) => r.id === id);
  if (index !== -1) {
    reservations[index].status = status;
    writeJsonFile(FILENAME, reservations);
    return reservations[index];
  }
  return null;
}

export async function removeReservation(id: string) {
  if (isSupabaseServerConfigured) {
    try {
      const { error } = await supabaseServer
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) console.warn('[Supabase Server] Delete error:', error);
    } catch (err) {
      console.error('[Supabase Server] Delete exception:', err);
    }
  }

  const reservations = readJsonFile<ReservationRecord[]>(FILENAME, []);
  const filtered = reservations.filter((r) => r.id !== id);
  const deleted = reservations.find((r) => r.id === id);
  writeJsonFile(FILENAME, filtered);
  return deleted || null;
}
