import { Router } from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  fetchAllReservations,
  insertReservation,
  updateReservationStatus,
  removeReservation,
} from './db/reservations.js';
import {
  getSetting,
  saveSetting,
  getAllTransferPricings,
  upsertTransferPricing,
} from './db/settings';
import { getOrCreateUser } from './db/users';
import {
  fetchAllVideos,
  insertVideo,
  setActiveVideo,
  removeVideo,
  fetchAllMedia,
  insertMedia,
  removeMedia,
} from './db/videos';
import { uploadToCloudinary, checkIsCloudinaryConfigured, pingCloudinary, getCloudinaryConfig } from './lib/cloudinary';
import { uploadFileToSupabaseStorage } from './lib/supabaseServer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI (if key is present)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Ensure uploads directory is in the public folder for persistence in AI Studio, 
// but use /tmp in production/serverless environments like Vercel.
const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const uploadsDir = isProd 
  ? path.join('/tmp', 'uploads') 
  : path.resolve(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('Failed to create uploads directory:', uploadsDir, err);
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${Date.now()}-${safeBase}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB limit
});

export const apiRouter = Router();

// 1. Reservations
apiRouter.get('/reservations', async (_req: Request, res: Response) => {
  try {
    const data = await fetchAllReservations();
    const mapped = data.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      tour_date: r.tourDate,
      tour_type: r.tourType,
      guests: r.guests,
      notes: r.notes,
      status: r.status,
      created_at: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
    res.json({ data: mapped, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reservations';
    console.error('Error in GET /reservations:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/reservations', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, tour_date, tourDate, tour_type, tourType, guests, notes, id } = req.body;
    const created = await insertReservation({
      id,
      name,
      phone,
      email,
      tourDate: tour_date || tourDate,
      tourType: tour_type || tourType || 'full_day',
      guests: Number(guests) || 1,
      notes,
    });
    const mapped = {
      id: created.id,
      name: created.name,
      phone: created.phone,
      email: created.email,
      tour_date: created.tourDate,
      tour_type: created.tourType,
      guests: created.guests,
      notes: created.notes,
      status: created.status,
      created_at: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    };
    res.json({ data: [mapped], error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create reservation';
    console.error('Error in POST /reservations:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.patch('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const status = String(req.body.status);
    const updated = await updateReservationStatus(id, status);
    res.json({ data: updated, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update reservation';
    console.error('Error in PATCH /reservations/:id:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.delete('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await removeReservation(id);
    res.json({ data: deleted, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete reservation';
    console.error('Error in DELETE /reservations/:id:', err);
    res.status(500).json({ data: null, error: message });
  }
});

// 2. Videos
apiRouter.get('/videos/active', async (_req: Request, res: Response) => {
  try {
    const videoList = await fetchAllVideos();
    const active = videoList.find((v) => v.isActive === 1) || videoList[0] || null;
    res.json({ data: active, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch active video';
    console.error('Error in GET /videos/active:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.get('/videos', async (_req: Request, res: Response) => {
  try {
    const videoList = await fetchAllVideos();
    res.json({ data: videoList, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch videos';
    console.error('Error in GET /videos:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/videos', async (req: Request, res: Response) => {
  try {
    const { title, url, thumbnailUrl, format, duration, fileSize, isActive } = req.body;
    if (!title || !url) {
      return res.status(400).json({ data: null, error: 'Title and URL are required' });
    }
    const created = await insertVideo({
      title,
      url,
      thumbnailUrl,
      format: format === 'vertical' ? 'vertical' : 'horizontal',
      duration,
      fileSize,
      isActive: isActive ? 1 : 0,
    });
    res.json({ data: created, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save video';
    console.error('Error in POST /videos:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/videos/upload', upload.single('video'), async (req: Request, res: Response) => {
  try {
    let finalUrl = '';
    const format: 'horizontal' | 'vertical' = req.body?.format === 'vertical' ? 'vertical' : 'horizontal';
    let title = req.body?.title ? String(req.body.title).trim() : '';
    let fileSizeStr = '';
    let localFilePath = '';

    if (req.file) {
      const safeName = req.file.filename;
      localFilePath = req.file.path;
      finalUrl = `/uploads/${safeName}`;
      fileSizeStr = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
      if (!title) {
        title = req.file.originalname.replace(/\.[^/.]+$/, '');
      }
    } else if (req.body?.base64Data && req.body?.fileName) {
      const { base64Data, fileName: rawFileName } = req.body;
      const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = path.extname(rawFileName) || '.mp4';
      const safeBase = rawFileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = `${Date.now()}-${safeBase}${ext}`;
      localFilePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(localFilePath, buffer);
      finalUrl = `/uploads/${safeName}`;
      fileSizeStr = (buffer.length / (1024 * 1024)).toFixed(1) + ' MB';
      if (!title) {
        title = rawFileName.replace(/\.[^/.]+$/, '');
      }
    } else if (req.body?.url) {
      finalUrl = req.body.url;
      title = title || 'VIP Tanıtım Videosu';
    } else {
      return res.status(400).json({ data: null, error: 'Video dosyası veya URL bulunamadı.' });
    }

    let generatedThumbnail = '/images/fleet_vito_lounge.jpg';

    if (localFilePath && fs.existsSync(localFilePath)) {
      if (checkIsCloudinaryConfigured()) {
        try {
          const cld = await uploadToCloudinary(localFilePath, {
            folder: 'mert_vip/videos',
            resource_type: 'video',
          });
          if (cld?.secure_url) {
            finalUrl = cld.secure_url;
            generatedThumbnail = cld.secure_url.replace(/\.[^/.]+$/, '.jpg');
          }
        } catch (cldErr) {
          console.warn('Cloudinary upload warning, using local file URL:', cldErr);
        }
      }

      try {
        const supaStorageUrl = await uploadFileToSupabaseStorage(
          localFilePath,
          `videos/${path.basename(localFilePath)}`,
          'media'
        );
        if (supaStorageUrl && !checkIsCloudinaryConfigured()) {
          finalUrl = supaStorageUrl;
        }
      } catch (supaStorageErr) {
        console.warn('Supabase storage upload warning:', supaStorageErr);
      }
    }

    const videoRecord = await insertVideo({
      title: title || 'VIP Tanıtım Videosu',
      url: finalUrl,
      thumbnailUrl: generatedThumbnail,
      format,
      fileSize: fileSizeStr,
      isActive: 1,
    });

    res.json({ data: videoRecord, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Video yüklenirken sunucu hatası oluştu';
    console.error('Error in POST /videos/upload:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.patch('/videos/:id/activate', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await setActiveVideo(id);
    res.json({ data: updated, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to activate video';
    console.error('Error in PATCH /videos/:id/activate:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.delete('/videos/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await removeVideo(id);
    res.json({ data: deleted, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete video';
    console.error('Error in DELETE /videos/:id:', err);
    res.status(500).json({ data: null, error: message });
  }
});

// 3. Media Files
apiRouter.get('/media', async (_req: Request, res: Response) => {
  try {
    const mediaList = await fetchAllMedia();
    res.json({ data: mediaList, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch media';
    console.error('Error in GET /media:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/media/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let finalUrl = '';
    let fileName = '';
    let fileSizeKb = '';
    let isVideo = false;
    let localFilePath = '';
    const category = req.body?.category || 'general';

    if (req.file) {
      fileName = req.file.filename;
      localFilePath = req.file.path;
      finalUrl = `/uploads/${fileName}`;
      fileSizeKb = (req.file.size / 1024).toFixed(0) + ' KB';
      isVideo = req.file.mimetype.startsWith('video') || /\.(mp4|webm|mov|mkv)$/i.test(fileName);
    } else if (req.body?.base64Data && req.body?.fileName) {
      const { base64Data, fileName: rawFileName } = req.body;
      const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = path.extname(rawFileName) || '.jpg';
      const safeBase = rawFileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = `${Date.now()}-${safeBase}${ext}`;
      localFilePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(localFilePath, buffer);
      finalUrl = `/uploads/${safeName}`;
      fileSizeKb = (buffer.length / 1024).toFixed(0) + ' KB';
      isVideo = /\.(mp4|webm|mov|mkv)$/i.test(rawFileName);
      fileName = safeName;
    } else {
      return res.status(400).json({ data: null, error: 'Dosya bulunamadı' });
    }

    if (localFilePath && fs.existsSync(localFilePath)) {
      if (checkIsCloudinaryConfigured()) {
        try {
          const cld = await uploadToCloudinary(localFilePath, {
            folder: `mert_vip/${category || 'media'}`,
            resource_type: isVideo ? 'video' : 'image',
          });
          if (cld?.secure_url) {
            finalUrl = cld.secure_url;
          }
        } catch (cldErr) {
          console.warn('Cloudinary upload warning for media, using local file URL:', cldErr);
        }
      }

      try {
        const supaStorageUrl = await uploadFileToSupabaseStorage(
          localFilePath,
          `${category || 'media'}/${path.basename(localFilePath)}`,
          'media'
        );
        if (supaStorageUrl && !checkIsCloudinaryConfigured()) {
          finalUrl = supaStorageUrl;
        }
      } catch (supaStorageErr) {
        console.warn('Supabase storage upload warning for media:', supaStorageErr);
      }
    }

    const mediaRecord = await insertMedia({
      name: fileName,
      url: finalUrl,
      fileType: isVideo ? 'video' : 'image',
      fileSize: fileSizeKb,
      category,
    });

    res.json({ data: mediaRecord, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Medya yüklenirken hata oluştu';
    console.error('Error in POST /media/upload:', err);
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.delete('/media/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await removeMedia(id);
    res.json({ data: deleted, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete media';
    console.error('Error in DELETE /media/:id:', err);
    res.status(500).json({ data: null, error: message });
  }
});

// Cloudinary connection check
apiRouter.get('/cloudinary/status', async (_req: Request, res: Response) => {
  const configured = checkIsCloudinaryConfigured();
  let isConnected = false;
  if (configured) {
    isConnected = await pingCloudinary();
  }
  res.json({
    configured,
    connected: isConnected,
    cloudName: getCloudinaryConfig().cloud_name || null,
  });
});

// 4. Settings
apiRouter.get('/settings/:key', async (req: Request, res: Response) => {
  try {
    const data = await getSetting(String(req.params.key));
    res.json({ data, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get setting';
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/settings/:key', async (req: Request, res: Response) => {
  try {
    const saved = await saveSetting(String(req.params.key), req.body);
    res.json({ data: saved, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save setting';
    res.status(500).json({ data: null, error: message });
  }
});

// 5. Pricing
apiRouter.get('/pricing', async (_req: Request, res: Response) => {
  try {
    const items = await getAllTransferPricings();
    res.json({ data: items, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch pricings';
    res.status(500).json({ data: null, error: message });
  }
});

apiRouter.post('/pricing', async (req: Request, res: Response) => {
  try {
    const saved = await upsertTransferPricing(req.body);
    res.json({ data: saved, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save pricing';
    res.status(500).json({ data: null, error: message });
  }
});

// 6. User Sync
apiRouter.post('/auth/sync', async (req: Request, res: Response) => {
  try {
    const { uid, email, name } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing uid or email' });
    }
    const user = await getOrCreateUser(uid, email, name);
    res.json({ data: user, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to sync user';
    res.status(500).json({ data: null, error: message });
  }
});

function getSmartWebsiteResponse(msg: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes('fiyat') || lower.includes('ücret') || lower.includes('kaç para') || lower.includes('maliyet') || lower.includes('ne kadar') || lower.includes('tarife')) {
    return 'Bodrum Luxury Transfer fiyatlarımız kalkış ve varış noktasına göre dinamik olarak hesaplanmaktadır.\n\n• Milas-Bodrum BJV Havalimanı transfer ücretlerini görmek için ana sayfamızdaki "Online Rezervasyon" formunda varış adresinizi seçmeniz yeterlidir.\n• Adres seçilmediğinde sistem varsayılan olarak 0 € gösterir.\n\nÖrnek Fiyatlar:\n• BJV Havalimanı - Torba: ~50 €\n• BJV Havalimanı - Yalıkavak Marina: ~70 €\n• BJV Havalimanı - Göltürkbükü: ~65 €\n\nDirekt rezervasyon ve özel teklif için: +90 539 440 78 23';
  }

  if (lower.includes('araç') || lower.includes('filo') || lower.includes('vito') || lower.includes('sprinter') || lower.includes('maybach') || lower.includes('minibüs') || lower.includes('araba')) {
    return 'Bodrum Luxury Transfer lüks transfer filomuz 4 özel araç seçeneğinden oluşmaktadır:\n\n1. Mercedes-Benz Maybach Design (5 Kişilik) - Lüksün zirvesi, masajlı koltuklar, yıldız tavan & Apple TV.\n2. Mercedes-Vito Premium Van (6 Kişilik) - Deri koltuklar, geniş bagaj, Wi-Fi ve ikramlar.\n3. Mercedes-Benz Sprinter VIP (9-13 Kişilik) - Kalabalık gruplar ve aileler için ultra konforlu.\n4. Mercedes-Benz Sprinter Ultra VIP (13+ Kişilik) - Özel iç aydınlatma, buzdolabı ve geniş VIP alan.\n\nFilomuzu incelemek ve araç seçimi yapmak için ana sayfamızdaki "Lüks VIP Filomuz" bölümüne bakabilirsiniz.';
  }

  if (lower.includes('rezervasyon') || lower.includes('kirala') || lower.includes('çağır') || lower.includes('al') || lower.includes('sipariş') || lower.includes('rezerve')) {
    return 'Rezervasyonunuzu 1 dakika içinde online yapabilirsiniz!\n\n1. Ana sayfamızdaki rezervasyon formuna gidin.\n2. Kalkış ve varış noktanızı, tarih ve saati seçin.\n3. Size en uygun VIP aracı belirleyip "Rezervasyon Talebi" butonuna tıklayın.\n\nAyrıca WhatsApp veya telefon üzerinden anında destek almak için +90 539 440 78 23 numaramızdan bize ulaşabilirsiniz.';
  }

  if (lower.includes('iletişim') || lower.includes('telefon') || lower.includes('numara') || lower.includes('whatsapp') || lower.includes('adres') || lower.includes('neredesiniz') || lower.includes('ulaşım')) {
    return 'Bodrum Luxury Transfer İletişim Bilgileri:\n\n• Telefon / WhatsApp: +90 539 440 78 23\n• Bölge: Bodrum Merkez, Yalıkavak, BJV Havalimanı & Tüm Muğla / Ege Bölgesi\n• TÜRSAB Belge No: 6550\n• Çalışma Saatleri: 7 Gün 24 Saat Kesintisiz Hizmet';
  }

  if (lower.includes('havalimanı') || lower.includes('bjv') || lower.includes('karşılama') || lower.includes('uçak') || lower.includes('uçağım')) {
    return 'Bodrum Milas (BJV) Havalimanı VIP Karşılama Hizmetimiz:\n\n• Şoförümüz sizi terminal çıkışında isminiz yazılı tabela ile karşılar.\n• Uçuş rötar yapsa dahi ekstra ücret alınmaz, canlı uçuş takibi yapılır.\n• Bagaj yardımınız profesyonel ekibimizce sağlanır.\n\nHemen rezervasyon yapmak için +90 539 440 78 23 numarasını arayabilir veya sitedeki formu doldurabilirsiniz.';
  }

  if (lower.includes('merhaba') || lower.includes('selam') || lower.includes('günaydın') || lower.includes('iyi günler') || lower.includes('iyi akşamlar') || lower.includes('hi') || lower.includes('hello')) {
    return 'Merhaba! Bodrum Luxury Transfer Asistanına hoş geldiniz.\n\nBodrum Havalimanı (BJV) VIP transferleri, lüks araç filomuz, özel şoförlü tahsis ve fiyatlarımız hakkında sorularınızı yanıtlamaktan memnuniyet duyarım. Size nasıl yardımcı olabilirim?';
  }

  return 'Bodrum Luxury Transfer olarak size en üst düzey VIP seyahat deneyimini sunuyoruz.\n\n• Filomuz: Mercedes Maybach Design, Vito Premium, Sprinter VIP ve Sprinter Ultra VIP.\n• Hizmet Bölgelerimiz: Bodrum Havalimanı (BJV), Yalıkavak Marina, Torba, Göltürkbükü ve çevre iller.\n• TÜRSAB Belge No: 6550 (7/24 Kesintisiz Hizmet)\n\nFiyat hesaplamak veya rezervasyon oluşturmak için ana sayfadaki formu kullanabilir, veya direkt olarak +90 539 440 78 23 numarasından bizimle iletişime geçebilirsiniz.';
}

// 7. AI Chat Assistant
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const cleanMessage = String(message || '').trim();

    if (!cleanMessage) {
      return res.json({ text: getSmartWebsiteResponse('merhaba') });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const formattedHistory = (Array.isArray(history) ? history : [])
          .filter((h): h is { role: string; parts: Array<{ text: string }> } => Boolean(h && typeof h === 'object' && 'role' in h && Array.isArray((h as { parts?: unknown }).parts) && (h as { parts: Array<{ text?: unknown }> }).parts[0]?.text))
          .map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(h.parts[0].text) }],
          }));

        const contents = [
          ...formattedHistory,
          { role: 'user', parts: [{ text: cleanMessage }] },
        ];

        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: `Sen Bodrum Luxury Transfer şirketinin resmi asistanısın.
            Şirket Bodrum merkezli olup; Bodrum Havalimanı (BJV), Yalıkavak Marina, Torba, Göltürkbükü ve çevre illere (Antalya, Marmaris, Fethiye, Didim) 7/24 VIP transfer hizmeti sağlamaktadır.
            TÜRSAB Belge No: 6550.
            Filonuzdaki araçlar:
            1. Mercedes-Benz Maybach Design (5 Kişi, Masajlı Koltuk, Yıldız Tavan, Apple TV)
            2. Mercedes-Vito Premium (6 Kişi, Deri Koltuk, Wi-Fi, İkramlar)
            3. Mercedes-Benz Sprinter VIP (9-13 Kişi)
            4. Mercedes-Benz Sprinter Ultra VIP (13+ Kişi, TV, Buzdolabı)
            Fiyatlandırma: Web sitesinde adres girilerek anında hesaplanır.
            İletişim & WhatsApp: +90 539 440 78 23.
            Dil: Türkçe. Her zaman son derece nazik, profesyonel, lüks marka diline uygun ve net cevaplar ver.
            Rezervasyon isteyeni ana sayfadaki rezervasyon motoruna veya WhatsApp'a yönlendir.`,
          },
        });

        if (result && result.text) {
          return res.json({ text: result.text });
        }
      } catch (geminiErr) {
        console.warn('Gemini API warning, falling back to website knowledge base:', geminiErr);
      }
    }

    const fallbackResponse = getSmartWebsiteResponse(cleanMessage);
    res.json({ text: fallbackResponse });
  } catch (err: unknown) {
    console.error('Chat endpoint error:', err);
    const safeFallback = getSmartWebsiteResponse(req.body?.message || '');
    res.json({ text: safeFallback });
  }
});
