const fs = require('fs');

const file = fs.readFileSync('src/lib/translations.ts', 'utf8');

const faqs = {
  tr: {
    faqTitle: 'Sıkça Sorulan Sorular',
    faq1Q: 'Turlarınız saat kaçta başlıyor ve bitiyor?',
    faq1A: 'Tam gün turlarımız 10:00 - 17:00, yarım gün turlarımız ise 17:30 - 21:00 (Gün batımı) saatleri arasında gerçekleşmektedir. Özel talepleriniz doğrultusunda saatlerde esneklik sağlayabiliyoruz.',
    faq2Q: 'Fiyata neler dahil?',
    faq2A: 'Öğle/Akşam yemeği, alkolsüz içecekler, meyve ikramları, yakıt (standart rota için), mürettebat hizmetleri ve teknedeki su sporları ekipmanlarının kullanımı fiyata dahildir.',
    faq3Q: 'Yeme-içme menüsünde neler var?',
    faq3A: 'Menümüz misafirlerimizin tercihlerine göre şekillenir. Et, balık veya tavuk seçenekleriyle Ege mezeleri servis ediyoruz. Özel diyet/alerji durumlarınızı rezervasyon sırasında belirtebilirsiniz.',
    faq4Q: 'Marina kuralları nelerdir?',
    faq4A: 'Yalıkavak Marina giriş kuralları gereği, misafirlerimizin yata biniş öncesinde isim listelerinin marinaya bildirilmesi gerekmektedir. Ayakkabıyla yata binilmesine izin verilmemektedir.',
    faq5Q: 'Rezervasyon ve iptal politikası nasıl çalışıyor?',
    faq5A: 'Rezervasyonun kesinleşmesi için toplam tutarın %30\'u ön ödeme olarak alınır. Turdan 7 gün öncesine kadar yapılan iptallerde kaporanız iade edilir.'
  },
  en: {
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'What time do your tours start and end?',
    faq1A: 'Full-day tours run from 10:00 to 17:00, and half-day (sunset) tours are from 17:30 to 21:00. We can provide flexibility in hours based on your special requests.',
    faq2Q: 'What is included in the price?',
    faq2A: 'Lunch/Dinner, soft drinks, fruit platters, fuel (for standard routes), crew services, and the use of water sports equipment on board are included in the price.',
    faq3Q: 'What is on the food & beverage menu?',
    faq3A: 'Our menu is tailored to our guests\' preferences. We serve meat, fish, or chicken options along with Aegean mezes. You can specify any special diet/allergy requirements during booking.',
    faq4Q: 'What are the marina policies?',
    faq4A: 'As per Yalıkavak Marina rules, a guest list must be provided to the marina before boarding. Wearing shoes on the yacht is not permitted.',
    faq5Q: 'How does the booking and cancellation policy work?',
    faq5A: 'A 30% deposit is required to confirm the reservation. Cancellations made up to 7 days before the tour are fully refundable.'
  },
  ru: {
    faqTitle: 'Часто задаваемые вопросы',
    faq1Q: 'В какое время начинаются и заканчиваются ваши туры?',
    faq1A: 'Туры на целый день проходят с 10:00 до 17:00, а туры на полдня (на закате) - с 17:30 до 21:00. Мы можем изменить время по вашему запросу.',
    faq2Q: 'Что включено в стоимость?',
    faq2A: 'Обед/ужин, безалкогольные напитки, фруктовые тарелки, топливо (для стандартных маршрутов), услуги экипажа и использование оборудования для водных видов спорта включены в стоимость.',
    faq3Q: 'Какое у вас меню?',
    faq3A: 'Наше меню составляется с учетом предпочтений гостей. Мы предлагаем мясные, рыбные или куриные блюда с эгейскими закусками. Пожалуйста, сообщите нам о любой диете/аллергии при бронировании.',
    faq4Q: 'Каковы правила марины?',
    faq4A: 'Согласно правилам Ялыкавак Марины, перед посадкой необходимо предоставить список гостей. Находиться на яхте в обуви запрещено.',
    faq5Q: 'Какова политика бронирования и отмены?',
    faq5A: 'Для подтверждения бронирования требуется предоплата 30%. При отмене за 7 дней до тура предоплата возвращается полностью.'
  },
  de: {
    faqTitle: 'Häufig gestellte Fragen',
    faq1Q: 'Wann beginnen und enden Ihre Touren?',
    faq1A: 'Ganztagestouren finden von 10:00 bis 17:00 Uhr statt, Halbtagestouren (Sonnenuntergang) von 17:30 bis 21:00 Uhr. Auf Anfrage können wir die Zeiten anpassen.',
    faq2Q: 'Was ist im Preis inbegriffen?',
    faq2A: 'Mittag-/Abendessen, alkoholfreie Getränke, Obstteller, Treibstoff (für Standardrouten), Crew-Service und die Nutzung der Wassersportausrüstung an Bord sind im Preis inbegriffen.',
    faq3Q: 'Was steht auf der Speisekarte?',
    faq3A: 'Unsere Speisekarte wird nach den Vorlieben unserer Gäste zusammengestellt. Wir servieren Fleisch, Fisch oder Geflügel mit ägäischen Vorspeisen. Bitte teilen Sie uns Allergien/Diäten bei der Buchung mit.',
    faq4Q: 'Was sind die Regeln der Marina?',
    faq4A: 'Gemäß den Regeln der Yalıkavak Marina muss vor dem Boarding eine Gästeliste übermittelt werden. Das Tragen von Schuhen auf der Yacht ist nicht gestattet.',
    faq5Q: 'Wie lauten die Buchungs- und Stornierungsbedingungen?',
    faq5A: 'Zur Bestätigung der Reservierung ist eine Anzahlung von 30 % erforderlich. Stornierungen, die bis zu 7 Tage vor der Tour erfolgen, werden vollständig erstattet.'
  },
  ar: {
    faqTitle: 'الأسئلة الشائعة',
    faq1Q: 'في أي وقت تبدأ وتنتهي جولاتكم؟',
    faq1A: 'الجولات ليوم كامل من 10:00 إلى 17:00، وجولات نصف يوم (الغروب) من 17:30 إلى 21:00. يمكننا توفير مرونة في المواعيد بناءً على طلباتكم.',
    faq2Q: 'ما الذي يشمله السعر؟',
    faq2A: 'الغداء/العشاء، المشروبات الغازية، أطباق الفواكه، الوقود (للمسارات القياسية)، خدمات الطاقم، واستخدام معدات الرياضات المائية على متن اليخت مشمولة في السعر.',
    faq3Q: 'ماذا يوجد في قائمة الطعام والمشروبات؟',
    faq3A: 'يتم إعداد قائمتنا لتناسب تفضيلات ضيوفنا. نقدم خيارات اللحوم أو الأسماك أو الدجاج مع المقبلات الإيجية. يرجى إبلاغنا بأي متطلبات غذائية خاصة عند الحجز.',
    faq4Q: 'ما هي قوانين المارينا؟',
    faq4A: 'وفقًا لقواعد ياليكافاك مارينا، يجب تقديم قائمة بأسماء الضيوف إلى المارينا قبل الصعود. لا يُسمح بارتداء الأحذية على اليخت.',
    faq5Q: 'كيف تعمل سياسة الحجز والإلغاء؟',
    faq5A: 'مطلوب إيداع 30٪ لتأكيد الحجز. يتم استرداد المبلغ بالكامل في حالة الإلغاء قبل 7 أيام من الرحلة.'
  }
};

let newContent = file;

Object.keys(faqs).forEach(lang => {
  const langObj = faqs[lang];
  let toAppend = '';
  Object.keys(langObj).forEach(key => {
    toAppend += `\n    ${key}: '${langObj[key].replace(/'/g, "\\'")}',`;
  });
  
  // Find where `terms: ` is for this language
  const regex = new RegExp(`(terms: '.*',\\s*privacy: '.*',)(\\s*})`, 'g');
  // Wait, regex might replace all, let's just do it directly. We know the exact string.
  // We can do it by finding the block of each language.
});

// An easier way is just to replace `privacy: '...',` with `privacy: '...', \n // FAQ \n ...`
Object.keys(faqs).forEach(lang => {
  const termsMatch = newContent.match(new RegExp(`(${lang}: \\{[\\s\\S]*?privacy: '.*?')\\s*\\}`));
  if (termsMatch) {
    let toAppend = ',\n    // FAQ';
    Object.keys(faqs[lang]).forEach(key => {
      toAppend += `\n    ${key}: '${faqs[lang][key].replace(/'/g, "\\'")}',`;
    });
    newContent = newContent.replace(termsMatch[1], termsMatch[1] + toAppend + '\n  ');
  }
});

fs.writeFileSync('src/lib/translations.ts', newContent, 'utf8');
