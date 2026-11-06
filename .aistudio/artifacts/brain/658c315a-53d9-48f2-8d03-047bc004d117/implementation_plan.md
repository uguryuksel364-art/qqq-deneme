# Kilometre Başına Ücret Tarifesi Yönetim Sistemi (Açma/Kapatma Seçeneği)

Yönetici (Admin) panelinde kilometre başına kaç Euro (€/km) olacağını doğrudan belirleyen, istenildiğinde tek tıkla açılıp kapatılabilen (Aktif / Devre Dışı) esnek bir tarife kontrol sistemi eklenmesi.

---

### Kullanıcı Tercihleri ve Alınan Kararlar

> [!IMPORTANT]
> Kullanıcı ile yapılan netleştirme doğrultusunda:
> - **Kilometre Başına Ücret Kapsamı:** Kilometre tarifesi aktif edildiğinde sabit Milas-Bodrum Havalimanı paket tarifelerini bozmayacak; yalnızca **özel adresler** ve **ilçe/koylar arası ara güzergahlarda** uygulanacaktır.
> - **Tarife Kapalıyken Çalışma Mantığı:** Tarife kapatıldığında sistem otomatik km hesabı yapmak yerine en yakın bölgenin sabit paket fiyatını referans alarak çalışacaktır.

---

## 1. Genel Bakış ve Temel Konsept

- **Ne Yapıyor?** Yönetici panelindeki "Fiyat & Bölge Yönetimi" ekranına, kilometre bazlı fiyatlandırmayı yöneten modern bir kontrol kartı entegre edilir. Yönetici km başına Euro tutarını (örneğin 1.50 €/km), açılış ücretini ve minimum transfer tutarını belirleyebilir; ayrıca tüm bu sistemi tek bir şık toggle anahtarıyla "Açık (Aktif)" veya "Kapalı (Devre Dışı)" konumuna getirebilir.
- **Kullanım Alanı:** Bodrum içi özel villalar, marinalar arası transferler ve havalimanı harici özel güzergahlarda fiyat politikasını sezonluk veya anlık olarak esnekçe yönetebilmek.
- **Sağlanan Değer:** Hem sabit fiyatlı havalimanı transferleri korunur hem de yönetici dilediğinde km başına serbest fiyatlandırmayı devreye alabilir veya kapatabilir.

---

## 2. Kullanıcı Deneyimi ve Arayüz Tasarımı (UX & Visual Design)

### Yönetici Paneli Deneyimi (Admin Panel):
1. **Durum Anahtarı (Toggle Switch):**
   - Kartın başında belirgin bir açık/kapalı anahtarı yer alır.
   - **Aktif Durum:** Zümrüt yeşili (`bg-emerald-500`) ışıklı rozet ve "Kilometre Tarifesi: AKTİF" ibaresi.
   - **Pasif Durum:** Muted gri/metalik rozet ve "Kilometre Tarifesi: DEVRE DIŞI (Sabit Bölge Fiyatları Geçerli)" ibaresi.
2. **Km Başına Euro Giriş Alanı:**
   - Sayısal giriş kutusu (€/km) ve hızlı artırma/azaltma imkanı.
   - Değişiklik anında "Örnek Hesaplama" önizleme kutucuğunda (Örn: 40 km mesafe için toplam tutar) canlı olarak test edilebilir.
3. **Kaydetme ve Geri Alma:**
   - Değişiklikler tek tıkla kaydedilir ve anında sitedeki rezervasyon motoruna (`SmartBookingEngine`) yansır.

### Müşteri / Rezervasyon Motoru Deneyimi (Frontend Engine):
- **Tarife AÇIK İken:** Açık adres seçildiğinde OSRM canlı yol mesafesi üzerinden yönetici tarafından belirlenen km başına ücret uygulanır. Rota kartında "KM TARİFESİ" etiketi gösterilir.
- **Tarife KAPALI İken:** Km tarifesi devre dışı bırakıldığında, rota en yakın bilinen bölge paket fiyatına sabitlenir veya standart tarife etiketiyle sunulur.

---

## 3. Ürün Kararları ve Mimari Tercihler

- **Karar 1: `KmTariff` Yapısına `enabled: boolean` Eklenmesi**
  - *Neden:* Mevcut veri modelini (`KmTariff`) bozmadan geriye dönük tam uyumlu bir şekilde `enabled` (varsayılan: `true` veya `false`) alanı eklenir.
  - *Fayda:* LocalStorage ve API senkronizasyonunda veri kaybı yaşanmaz.
- **Karar 2: Sabit Havalimanı Rotalarının Önceliği**
  - *Neden:* Milas-Bodrum Havalimanı ile Yalıkavak, Türkbükü, Bodrum Merkez gibi 10 ana bölge arasındaki resmi transfer ücretleri TÜRSAB standartlarında sabit tutulur.
  - *Fayda:* Müşteriye güven veren sabit fiyat garantisi korunur, belirsizlik önlenir.

---

## 4. Teknik Mimari ve Veri Akışı

```
┌────────────────────────────────────────────────────────┐
│                   YÖNETİCİ PANELİ                      │
│             (TransferPriceManager.tsx)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Toggle: AÇIK/KAPALI]                            │  │
│  │ Km Başına Ücret: [ 1.50 ] €/km                   │  │
│  │ Açılış Ücreti:   [ 20 ] €                        │  │
│  │ Minimum Ücret:   [ 45 ] €                        │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │ saveKmTariff()
                           ▼
┌────────────────────────────────────────────────────────┐
│              MERKEZİ VERİ & HESAPLAMA                  │
│               (transferPricing.ts)                     │
│  - KmTariff { enabled, perKmRateEur, ... }             │
│  - calculateRoutePrice() [enabled kontrolü]            │
│  - Event: 'transferRatesUpdated'                       │
└──────────────────────────┬─────────────────────────────┘
                           │ Canlı Güncelleme
                           ▼
┌────────────────────────────────────────────────────────┐
│             REZERVASYON MOTORU & HARİTA                │
│             (SmartBookingEngine.tsx)                   │
│  - enabled === true  -> Dinamik Km Ücreti Hesabı       │
│  - enabled === false -> Sabit Bölge Paketi Hesabı      │
└────────────────────────────────────────────────────────┘
```

### Değişiklik Yapılacak Alanlar:
1. `src/lib/transferPricing.ts`:
   - `KmTariff` arayüzüne `enabled: boolean` eklenmesi.
   - `getKmTariff()` ve `DEFAULT_KM_TARIFF` içine `enabled` alanının entegrasyonu.
   - `calculateRoutePrice()` fonksiyonunda `tariff.enabled` kontrolünün işletilmesi.
2. `src/components/TransferPriceManager.tsx`:
   - Yönetici kartına lüks, anlaşılır toggle anahtarı ve km başı Euro alanının yerleştirilmesi.
   - Anlık durum bilgilendirmesi ve test önizleme çubuğu.
3. `src/components/SmartBookingEngine.tsx`:
   - Tarife kapalı olduğunda arayüz rozet ve fiyat dökümünün uyumlu çalışması.
