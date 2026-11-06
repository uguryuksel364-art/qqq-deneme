export const CONTACT = {
  phoneDisplay: '+90 539 440 78 23',
  phoneE164: '+905394407823',
  whatsapp: '905394407823',
  email: 'mertviptransfer48@gmail.com',
  instagram: 'mertvip.48',
  instagramUrl: 'https://www.instagram.com/mertvip.48?psln=MXR2NHhycHF4dnc1ZA==',
  location: 'Yalıkavak Marina & BJV, Bodrum',
};

export function waLink(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const telLink = `tel:${CONTACT.phoneE164}`;

export const COUNTRY_CODES = [
  { code: '+90', label: 'TR (+90)', flag: '🇹🇷' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { code: '+1', label: 'US (+1)', flag: '🇺🇸' },
  { code: '+49', label: 'DE (+49)', flag: '🇩🇪' },
  { code: '+7', label: 'RU (+7)', flag: '🇷🇺' },
  { code: '+971', label: 'AE (+971)', flag: '🇦🇪' },
  { code: '+966', label: 'SA (+966)', flag: '🇸🇦' },
  { code: '+974', label: 'QA (+974)', flag: '🇶🇦' },
  { code: '+965', label: 'KW (+965)', flag: '🇰🇼' },
  { code: '+33', label: 'FR (+33)', flag: '🇫🇷' },
  { code: '+39', label: 'IT (+39)', flag: '🇮🇹' },
  { code: '+31', label: 'NL (+31)', flag: '🇳🇱' },
  { code: '+41', label: 'CH (+41)', flag: '🇨🇭' },
  { code: '+32', label: 'BE (+32)', flag: '🇧🇪' },
  { code: '+43', label: 'AT (+43)', flag: '🇦🇹' },
  { code: '+34', label: 'ES (+34)', flag: '🇪🇸' },
  { code: '+48', label: 'PL (+48)', flag: '🇵🇱' },
  { code: '+46', label: 'SE (+46)', flag: '🇸🇪' },
  { code: '+47', label: 'NO (+47)', flag: '🇳🇴' },
  { code: '+45', label: 'DK (+45)', flag: '🇩🇰' },
  { code: '+30', label: 'GR (+30)', flag: '🇬🇷' },
  { code: '+351', label: 'PT (+351)', flag: '🇵🇹' },
  { code: '+353', label: 'IE (+353)', flag: '🇮🇪' },
  { code: '+380', label: 'UA (+380)', flag: '🇺🇦' },
  { code: '+994', label: 'AZ (+994)', flag: '🇦🇿' },
  { code: '+972', label: 'IL (+972)', flag: '🇮🇱' },
];
