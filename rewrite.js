const fs = require('fs');
const content = `import { useEffect, useState } from 'react';

export type Language = 'tr' | 'en' | 'ru' | 'de' | 'ar';

export const translations = {
  tr: {
    home: 'Ana Sayfa',
    fleet: 'Filomuz',
    experiences: 'Deneyimler',
    reservation: 'Rezervasyon',
    whatsapp: 'WhatsApp',
    whatsappReserve: 'WhatsApp ile Rezervasyon',
    adminPanel: 'Yönetim Paneli',
    close: 'Kapat',
    
    // Hero
    liveTheBlue: 'Maviyi Yaşa.',
    journey: 'Yolculuğunuz bizim',
    passion: 'ilk tutkumuz.',
    heroDesc: 'Bodrum\\'un kalbi Yalıkavak Marina\\'dan başlayan özel lüks yat kiralama deneyimi. Günübirlik veya yarım günlük turlar; jet ski, su sporları ve tamamen size özel VIP hizmetlerle unutulmaz anlar sizi bekliyor.',
    onlineReservation: 'Online Rezervasyon',
    
    // OnBoard
    onBoardTitle: 'Yatta Sizi Neler Bekliyor?',
    onBoardDesc: 'Mavi yolculuğunuzun her anında mükemmelliği yaşamanız için tüm detayları düşündük.',
    onBoard1Title: 'Şef & Mürettebat',
    onBoard1Desc: 'Deneyimli kaptanımız ve güler yüzlü mürettebatımız tur boyunca tüm konforunuzu sağlar.',
    onBoard2Title: 'Gurme Menüler',
    onBoard2Desc: 'Ege mutfağının en seçkin lezzetleri, taze deniz ürünleri ve özel içecek seçkisi.',
    onBoard3Title: 'Su Sporları',
    onBoard3Desc: 'Jet ski, şnorkel ekipmanları, su kayağı ve yolculuğunuza heyecan katan diğer aktiviteler.',
    onBoard4Title: 'Kişisel Rota',
    onBoard4Desc: 'Bodrum\\'un en bakir ve temiz koylarında size özel planlanmış duraklama ve yüzme molaları.',
    
    // Fleet
    fleetTitle: 'Lüks Filomuz',
    fleetDesc: 'Bodrum sularında konfor ve performansın en üst düzey halini sunan, özenle bakımı yapılan özel yatlarımız.',
    capacity: 'Kapasite',
    length: 'Uzunluk',
    cabins: 'Kabin',
    requestReservation: 'Rezervasyon Talebi',
    
    // Experience
    experienceTitle: 'Benzersiz Bodrum Deneyimleri',
    experienceDesc: 'Yalnızca bir yat turu değil; Ege\\'nin saklı koylarında ömür boyu hatırlayacağınız lüks ve konfor dolu bir kaçamak tasarlıyoruz.',
    quote: '“Deniz, hayallerin başladığı yerdir; biz sadece o hayale demir atanlarız.”',
    
    // ReservationForm
    reservationFormTitle: 'Rezervasyon Talebi',
    fullName: 'Adınız Soyadınız',
    phone: 'Telefon Numaranız',
    email: 'E-posta (İsteğe bağlı)',
    tourDate: 'Tur Tarihi',
    tourDuration: 'Tur Süresi',
    fullDay: 'Tam Gün (10:00 - 17:00)',
    halfDay: 'Yarım Gün (17:30 - 21:00)',
    guestCount: 'Misafir Sayısı',
    notes: 'Özel İstekleriniz (İsteğe bağlı)',
    submitting: 'Gönderiliyor...',
    submitSuccess: 'Talebiniz Alındı',
    submitSuccessDesc: 'Rezervasyon talebiniz başarıyla iletildi. En kısa sürede WhatsApp veya telefon üzerinden sizinle iletişime geçeceğiz.',
    sendRequest: 'Talebi Gönder',
    
    // CtaFooter
    ctaTitle: 'Hayalinizdeki Mavi Yolculuğu Şimdi Planlayın',
    ctaDesc: 'Hemen online rezervasyon oluşturun veya size özel rotanızı tasarlamak için bizimle iletişime geçin.',
    ctaBtn: 'Hemen Online Rezervasyon',
    footerText: 'Bodrum Blue Yacht Tours. Tüm hakları saklıdır.',
    terms: 'Kullanım Koşulları',
    privacy: 'Gizlilik Politikası',
  },
  en: {
    home: 'Home',
    fleet: 'Our Fleet',
    experiences: 'Experiences',
    reservation: 'Reservation',
    whatsapp: 'WhatsApp',
    whatsappReserve: 'Book via WhatsApp',
    adminPanel: 'Admin Panel',
    close: 'Close',
    
    liveTheBlue: 'Live the Blue.',
    journey: 'Your journey is',
    passion: 'our passion.',
    heroDesc: 'Private luxury yacht charter experience starting from Yalıkavak Marina, the heart of Bodrum. Full-day or half-day tours; unforgettable moments await you with jet skis, water sports, and exclusive VIP services.',
    onlineReservation: 'Online Reservation',
    
    onBoardTitle: 'What Awaits You on Board?',
    onBoardDesc: 'We have considered every detail for you to experience perfection at every moment of your blue voyage.',
    onBoard1Title: 'Chef & Crew',
    onBoard1Desc: 'Our experienced captain and friendly crew ensure your complete comfort throughout the tour.',
    onBoard2Title: 'Gourmet Menus',
    onBoard2Desc: 'The most exquisite flavors of Aegean cuisine, fresh seafood, and a special selection of beverages.',
    onBoard3Title: 'Water Sports',
    onBoard3Desc: 'Jet ski, snorkeling equipment, water skiing, and other activities to add excitement to your journey.',
    onBoard4Title: 'Personal Itinerary',
    onBoard4Desc: 'Specially planned stops and swimming breaks in the most pristine bays of Bodrum.',
    
    fleetTitle: 'Our Luxury Fleet',
    fleetDesc: 'Our meticulously maintained private yachts offer the ultimate blend of comfort and performance in Bodrum waters.',
    capacity: 'Capacity',
    length: 'Length',
    cabins: 'Cabins',
    requestReservation: 'Request Booking',
    
    experienceTitle: 'Unique Bodrum Experiences',
    experienceDesc: 'More than just a yacht charter; we design a getaway full of luxury and comfort that you will remember for a lifetime in the hidden bays of the Aegean.',
    quote: '“The sea is where dreams begin; we are just those who anchor in that dream.”',
    
    reservationFormTitle: 'Reservation Request',
    fullName: 'Your Full Name',
    phone: 'Phone Number',
    email: 'Email (Optional)',
    tourDate: 'Tour Date',
    tourDuration: 'Tour Duration',
    fullDay: 'Full Day (10:00 - 17:00)',
    halfDay: 'Half Day (17:30 - 21:00)',
    guestCount: 'Number of Guests',
    notes: 'Special Requests (Optional)',
    submitting: 'Submitting...',
    submitSuccess: 'Request Received',
    submitSuccessDesc: 'Your reservation request has been successfully submitted. We will contact you via WhatsApp or phone as soon as possible.',
    sendRequest: 'Send Request',
    
    ctaTitle: 'Plan Your Dream Blue Cruise Now',
    ctaDesc: 'Book online now or contact us to design your custom itinerary.',
    ctaBtn: 'Book Online Now',
    footerText: 'Bodrum Blue Yacht Tours. All rights reserved.',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
  },
  ru: {
    home: 'Главная',
    fleet: 'Наш Флот',
    experiences: 'Впечатления',
    reservation: 'Бронирование',
    whatsapp: 'WhatsApp',
    whatsappReserve: 'Забронировать в WhatsApp',
    adminPanel: 'Панель Администратора',
    close: 'Закрыть',
    
    liveTheBlue: 'Живи Синевой.',
    journey: 'Ваше путешествие -',
    passion: 'наша страсть.',
    heroDesc: 'Аренда роскошных частных яхт из Ялыкавак Марины. Туры на целый день или полдня; вас ждут незабываемые моменты с водными мотоциклами, водными видами спорта и VIP-обслуживанием.',
    onlineReservation: 'Онлайн Бронирование',
    
    onBoardTitle: 'Что ждет вас на борту?',
    onBoardDesc: 'Мы продумали все детали, чтобы каждый момент вашего синего круиза был идеальным.',
    onBoard1Title: 'Шеф-повар и Экипаж',
    onBoard1Desc: 'Наш опытный капитан и дружелюбный экипаж обеспечат ваш полный комфорт во время тура.',
    onBoard2Title: 'Гурмэ Меню',
    onBoard2Desc: 'Самые изысканные блюда эгейской кухни, свежие морепродукты и напитки премиум-класса.',
    onBoard3Title: 'Водный спорт',
    onBoard3Desc: 'Гидроцикл, снаряжение для снорклинга, водные лыжи и другие развлечения.',
    onBoard4Title: 'Индивидуальный маршрут',
    onBoard4Desc: 'Специально спланированные остановки в самых чистых и диких бухтах Бодрума.',
    
    fleetTitle: 'Наш Роскошный Флот',
    fleetDesc: 'Наши тщательно ухоженные частные яхты предлагают идеальное сочетание комфорта и скорости в водах Бодрума.',
    capacity: 'Вместимость',
    length: 'Длина',
    cabins: 'Каюты',
    requestReservation: 'Запрос на Бронь',
    
    experienceTitle: 'Уникальный Опыт в Бодруме',
    experienceDesc: 'Больше чем просто аренда яхты; мы создаем незабываемый побег в скрытые бухты Эгейского моря.',
    quote: '“Море — это место, где рождаются мечты; мы лишь те, кто встает в них на якорь.”',
    
    reservationFormTitle: 'Запрос на Бронирование',
    fullName: 'Ваше имя и фамилия',
    phone: 'Номер телефона',
    email: 'Электронная почта (Опционально)',
    tourDate: 'Дата тура',
    tourDuration: 'Продолжительность тура',
    fullDay: 'Целый день (10:00 - 17:00)',
    halfDay: 'Полдня (17:30 - 21:00)',
    guestCount: 'Количество гостей',
    notes: 'Особые пожелания (Опционально)',
    submitting: 'Отправка...',
    submitSuccess: 'Запрос принят',
    submitSuccessDesc: 'Ваш запрос на бронирование успешно передан. Мы свяжемся с вами в WhatsApp или по телефону в ближайшее время.',
    sendRequest: 'Отправить запрос',
    
    ctaTitle: 'Спланируйте круиз вашей мечты прямо сейчас',
    ctaDesc: 'Забронируйте онлайн прямо сейчас или свяжитесь с нами для создания вашего маршрута.',
    ctaBtn: 'Забронировать онлайн',
    footerText: 'Bodrum Blue Yacht Tours. Все права защищены.',
    terms: 'Условия использования',
    privacy: 'Политика конфиденциальности',
  },
  de: {
    home: 'Startseite',
    fleet: 'Unsere Flotte',
    experiences: 'Erlebnisse',
    reservation: 'Reservierung',
    whatsapp: 'WhatsApp',
    whatsappReserve: 'Über WhatsApp buchen',
    adminPanel: 'Admin-Bereich',
    close: 'Schließen',
    
    liveTheBlue: 'Lebe das Blau.',
    journey: 'Ihre Reise ist',
    passion: 'unsere Leidenschaft.',
    heroDesc: 'Privater Luxus-Yachtcharter ab der Yalıkavak Marina, dem Herzen von Bodrum. Ganztags- oder Halbtagestouren; unvergessliche Momente mit Jetskis, Wassersport und exklusiven VIP-Services erwarten Sie.',
    onlineReservation: 'Online-Reservierung',
    
    onBoardTitle: 'Was erwartet Sie an Bord?',
    onBoardDesc: 'Wir haben an jedes Detail gedacht, damit Sie jeden Moment Ihrer blauen Reise in Perfektion erleben können.',
    onBoard1Title: 'Koch & Crew',
    onBoard1Desc: 'Unser erfahrener Kapitän und die freundliche Crew sorgen während der gesamten Tour für Ihren Komfort.',
    onBoard2Title: 'Gourmet-Küche',
    onBoard2Desc: 'Die exquisitesten Aromen der ägäischen Küche, frische Meeresfrüchte und eine erlesene Auswahl an Getränken.',
    onBoard3Title: 'Wassersport',
    onBoard3Desc: 'Jetski, Schnorchelausrüstung, Wasserski und andere Aktivitäten, die Ihre Reise bereichern.',
    onBoard4Title: 'Individuelle Route',
    onBoard4Desc: 'Eigens geplante Stopps und Badepausen in den unberührtesten Buchten von Bodrum.',
    
    fleetTitle: 'Unsere Flotte',
    fleetDesc: 'Unsere sorgfältig gewarteten Privatyachten bieten die perfekte Mischung aus Komfort und Leistung in den Gewässern von Bodrum.',
    capacity: 'Kapazität',
    length: 'Länge',
    cabins: 'Kabinen',
    requestReservation: 'Buchung anfragen',
    
    experienceTitle: 'Einzigartige Bodrum-Erlebnisse',
    experienceDesc: 'Mehr als nur ein Yachtcharter; wir entwerfen einen luxuriösen und komfortablen Rückzugsort in den versteckten Buchten der Ägäis, den Sie ein Leben lang in Erinnerung behalten werden.',
    quote: '„Im Meer beginnen die Träume; wir sind nur diejenigen, die in diesem Traum vor Anker gehen.“',
    
    reservationFormTitle: 'Reservierungsanfrage',
    fullName: 'Ihr vollständiger Name',
    phone: 'Telefonnummer',
    email: 'E-Mail-Adresse (Optional)',
    tourDate: 'Tour-Datum',
    tourDuration: 'Tour-Dauer',
    fullDay: 'Ganztags (10:00 - 17:00)',
    halfDay: 'Halbtags (17:30 - 21:00)',
    guestCount: 'Anzahl der Gäste',
    notes: 'Besondere Wünsche (Optional)',
    submitting: 'Wird gesendet...',
    submitSuccess: 'Anfrage erhalten',
    submitSuccessDesc: 'Ihre Buchungsanfrage wurde erfolgreich übermittelt. Wir werden uns so schnell wie möglich per WhatsApp oder Telefon mit Ihnen in Verbindung setzen.',
    sendRequest: 'Anfrage absenden',
    
    ctaTitle: 'Planen Sie jetzt Ihre Traum-Blaukreuzfahrt',
    ctaDesc: 'Buchen Sie jetzt online oder kontaktieren Sie uns, um Ihre maßgeschneiderte Route zu erstellen.',
    ctaBtn: 'Jetzt online buchen',
    footerText: 'Bodrum Blue Yacht Tours. Alle Rechte vorbehalten.',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutzrichtlinie',
  },
  ar: {
    home: 'الرئيسية',
    fleet: 'أسطولنا',
    experiences: 'تجاربنا',
    reservation: 'الحجز',
    whatsapp: 'واتساب',
    whatsappReserve: 'احجز عبر واتساب',
    adminPanel: 'لوحة التحكم',
    close: 'إغلاق',
    
    liveTheBlue: 'عش متعة البحر.',
    journey: 'رحلتك هي',
    passion: 'شغفنا الأول.',
    heroDesc: 'رحلات يخوت فاخرة خاصة في بودروم، تنطلق من مرسى ياليكافاك مارينا. رحلات ليوم كامل أو نصف يوم؛ بانتظارك لحظات لا تُنسى مع جيت سكي، رياضات مائية، ورفاهية الـ VIP المطلقة.',
    onlineReservation: 'الحجز عبر الإنترنت',
    
    onBoardTitle: 'ماذا ينتظرك على متن اليخت؟',
    onBoardDesc: 'لقد اعتنينا بأدق التفاصيل لنضمن لك رحلة بحرية مثالية في كل لحظة.',
    onBoard1Title: 'الطاهي وطاقم العمل',
    onBoard1Desc: 'قبطاننا ذو الخبرة وطاقم اليخت الودود سيسهرون على راحتك الكاملة طوال الرحلة.',
    onBoard2Title: 'وجبات فاخرة',
    onBoard2Desc: 'أرقى المأكولات من المطبخ الإيجي، والمأكولات البحرية الطازجة، وتشكيلة مشروبات خاصة.',
    onBoard3Title: 'الرياضات المائية',
    onBoard3Desc: 'جيت سكي، معدات السباحة والغطس، التزلج على الماء، وأنشطة ترفيهية أخرى تضفي الإثارة لرحلتك.',
    onBoard4Title: 'مسار مخصص',
    onBoard4Desc: 'توقف مخصص للسباحة والاستجمام في أكثر خلجان بودروم البكر والساحرة.',
    
    fleetTitle: 'أسطولنا الفاخر',
    fleetDesc: 'تجمع يخوتنا الخاصة ذات الصيانة الدقيقة بين أعلى مستويات الراحة والأداء المميز في مياه بودروم.',
    capacity: 'السعة',
    length: 'الطول',
    cabins: 'الكابينات',
    requestReservation: 'طلب حجز',
    
    experienceTitle: 'تجارب بودروم الفريدة',
    experienceDesc: 'أكثر من مجرد استئجار يخت؛ نحن نصمم ملاذاً من الفخامة والرفاهية التي سترافق ذاكرتك مدى الحياة في خلجان بحر إيجة الخفية.',
    quote: '“البحر هو المكان الذي تبدأ فيه الأحلام، ونحن لسنا سوى من يرسو بمرساته في ذلك الحلم.”',
    
    reservationFormTitle: 'طلب حجز يخت',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني (اختياري)',
    tourDate: 'تاريخ الرحلة',
    tourDuration: 'مدة الرحلة',
    fullDay: 'يوم كامل (10:00 - 17:00)',
    halfDay: 'نصف يوم (17:30 - 21:00)',
    guestCount: 'عدد الضيوف',
    notes: 'ملاحظات أو طلبات خاصة (اختياري)',
    submitting: 'جاري الإرسال...',
    submitSuccess: 'تم استلام طلبك بنجاح',
    submitSuccessDesc: 'تم إرسال طلب الحجز الخاص بك بنجاح. سنتواصل معك عبر الواتساب أو الهاتف في أقرب وقت ممكن.',
    sendRequest: 'إرسال الطلب',
    
    ctaTitle: 'خطط لرحلتك البحرية الحالمة الآن',
    ctaDesc: 'احجز عبر الإنترنت الآن أو اتصل بنا لتصميم مسار رحلتك الخاص.',
    ctaBtn: 'احجز عبر الإنترنت الآن',
    footerText: 'بودروم بلو لرحلات اليخوت. جميع الحقوق محفوظة.',
    terms: 'شروط الاستخدام',
    privacy: 'سياسة الخصوصية',
  }
};

const LANG_STORAGE_KEY = 'bodrum_blue_active_lang';

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(LANG_STORAGE_KEY) as Language) || 'tr';
    }
    return 'tr';
  });

  useEffect(() => {
    const handleLangChange = () => {
      const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (stored && stored !== lang) {
        setLangState(stored);
      }
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, [lang]);

  const setLang = (newLang: Language) => {
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    setLangState(newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = translations[lang] || translations.tr;

  return { lang, setLang, t };
}
`
fs.writeFileSync('src/lib/translations.ts', content, 'utf8');
