import { readJsonFile, writeJsonFile } from './local-db-util';
import { supabaseServer, isSupabaseServerConfigured } from '../lib/supabaseServer';

const SETTINGS_FILE = 'settings.json';
const PRICING_FILE = 'pricing.json';

interface SettingRecord {
  key: string;
  data: string;
  updatedAt: string;
}

interface TransferPricingRecord {
  id: string;
  zoneId: string;
  zoneName: string;
  priceEur: number;
  distanceKm: number;
  durationMins: number;
  updatedAt: string;
}

export async function getSetting(key: string) {
  if (isSupabaseServerConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (!error && data?.value) {
        return data.value;
      }
    } catch (err) {
      console.warn('[Supabase Server] Setting fetch error:', err);
    }
  }

  const settings = readJsonFile<SettingRecord[]>(SETTINGS_FILE, []);
  const match = settings.find((s) => s.key === key);
  if (!match) return null;
  try {
    return JSON.parse(match.data);
  } catch {
    return null;
  }
}

export async function saveSetting(key: string, data: unknown) {
  const now = new Date().toISOString();

  if (isSupabaseServerConfigured) {
    try {
      const { error } = await supabaseServer
        .from('settings')
        .upsert({ key, value: data, updated_at: now });
      
      if (error) console.warn('[Supabase Server] Setting save error:', error);
    } catch (err) {
      console.error('[Supabase Server] Setting save exception:', err);
    }
  }

  const settings = readJsonFile<SettingRecord[]>(SETTINGS_FILE, []);
  const index = settings.findIndex((s) => s.key === key);
  const jsonString = JSON.stringify(data);

  if (index !== -1) {
    settings[index].data = jsonString;
    settings[index].updatedAt = now;
  } else {
    settings.push({ key, data: jsonString, updatedAt: now });
  }

  writeJsonFile(SETTINGS_FILE, settings);
  return { key, data: jsonString, updatedAt: now };
}

export async function getAllTransferPricings() {
  if (isSupabaseServerConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from('settings')
        .select('value')
        .eq('key', 'transfer_pricing')
        .single();
      
      if (!error && data?.value && Array.isArray(data.value)) {
        return data.value as TransferPricingRecord[];
      }
    } catch (err) {
      console.warn('[Supabase Server] Pricing fetch error:', err);
    }
  }
  return readJsonFile<TransferPricingRecord[]>(PRICING_FILE, []);
}

export async function upsertTransferPricing(zone: {
  zoneId: string;
  zoneName: string;
  priceEur: number;
  distanceKm: number;
  durationMins: number;
}) {
  const pricings = await getAllTransferPricings();
  const index = pricings.findIndex((p) => p.zoneId === zone.zoneId);
  const now = new Date().toISOString();

  const updatedPricings = [...pricings];
  if (index !== -1) {
    updatedPricings[index] = {
      ...pricings[index],
      zoneName: zone.zoneName,
      priceEur: zone.priceEur,
      distanceKm: zone.distanceKm,
      durationMins: zone.durationMins,
      updatedAt: now,
    };
  } else {
    updatedPricings.push({
      id: Math.random().toString(36).slice(2, 9),
      ...zone,
      updatedAt: now,
    });
  }

  // Save to Supabase
  if (isSupabaseServerConfigured) {
    try {
      await supabaseServer
        .from('settings')
        .upsert({ key: 'transfer_pricing', value: updatedPricings, updated_at: now });
    } catch (err) {
      console.warn('[Supabase Server] Pricing save error:', err);
    }
  }

  writeJsonFile(PRICING_FILE, updatedPricings);
  return updatedPricings.find((p) => p.zoneId === zone.zoneId);
}
