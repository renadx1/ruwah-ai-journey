export interface CulturalPlace {
  id: string;
  name: string;
  nameEn: string;
  district: string; // الحي
  description: string;
  descriptionEn: string;
  category: 'museum' | 'heritage' | 'historical' | 'market';
  lat: number;
  lng: number;
  image: string; // emoji fallback
  photos: string[]; // image URLs
  rating: number;
  entryFee: string; // رسوم الدخول
  accessible: boolean; // يدعم الاحتياجات الخاصة
  openingHours: string;
  whyFamous?: string; // لماذا مشهور
  activities?: string[]; // الأنشطة
  familyFriendly?: boolean; // مناسب للعوائل
  visitDuration?: string; // مدة الزيارة المقترحة
  nearbyPlaces?: string[]; // أقرب أماكن
  officialUrl?: string; // رابط رسمي
  faqs?: { q: string; a: string }[]; // أسئلة متوقعة
}

// Riyadh popular cultural places — accurate coordinates
export const culturalPlaces: CulturalPlace[] = [
  {
    id: '1',
    name: 'المتحف الوطني السعودي',
    nameEn: 'Saudi National Museum',
    district: 'حي المربع',
    description:
      'أكبر متحف في المملكة العربية السعودية، يضم 8 قاعات تروي قصة الجزيرة العربية من فجر التاريخ حتى عصر التوحيد. يحتوي على آلاف القطع الأثرية والمخطوطات النادرة.',
    descriptionEn: 'The largest museum in Saudi Arabia.',
    category: 'museum',
    lat: 24.6469,
    lng: 46.7106,
    image: '🏛️',
    photos: [
      'https://images.unsplash.com/photo-1565060169187-5284f5d2c9d4?w=800&q=80',
      'https://images.unsplash.com/photo-1582034986517-30d80f4f5b4f?w=800&q=80',
    ],
    rating: 4.8,
    entryFee: '10 ريال',
    accessible: true,
    openingHours: '9 صباحًا – 9 مساءً',
  },
  {
    id: '2',
    name: 'حي الطريف التاريخي - الدرعية',
    nameEn: 'At-Turaif District',
    district: 'الدرعية',
    description:
      'موقع تراث عالمي مدرج في اليونسكو، كان مقرّ حكم الدولة السعودية الأولى. يشتهر بعمارته النجدية الطينية الفريدة وقصوره التاريخية.',
    descriptionEn: 'UNESCO World Heritage Site.',
    category: 'heritage',
    lat: 24.7340,
    lng: 46.5750,
    image: '🏰',
    photos: [
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
      'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&q=80',
    ],
    rating: 4.9,
    entryFee: '75 ريال',
    accessible: true,
    openingHours: '4 عصرًا – 11 مساءً',
  },
  {
    id: '3',
    name: 'قصر المصمك',
    nameEn: 'Masmak Fortress',
    district: 'حي الديرة',
    description:
      'حصن طيني تاريخي شهد فجر استعادة الرياض على يد الملك عبدالعزيز عام 1902م. يضم متحفًا يعرض أسلحة وصورًا ومقتنيات من تلك الحقبة.',
    descriptionEn: 'Historic mud fortress.',
    category: 'historical',
    lat: 24.6312,
    lng: 46.7136,
    image: '🏯',
    photos: [
      'https://images.unsplash.com/photo-1604608672516-f1b9b1e8a8e4?w=800&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
    ],
    rating: 4.7,
    entryFee: 'مجاني',
    accessible: false,
    openingHours: '8 صباحًا – 9 مساءً',
  },
  {
    id: '4',
    name: 'سوق الزل',
    nameEn: 'Souq Al-Zal',
    district: 'حي الديرة',
    description:
      'أقدم أسواق الرياض الشعبية، يمتد منذ أكثر من 110 سنة. تجد فيه السجاد العربي، البخور، الأزياء التراثية، والحرف اليدوية النجدية.',
    descriptionEn: 'Oldest folk market in Riyadh.',
    category: 'market',
    lat: 24.6298,
    lng: 46.7115,
    image: '🏪',
    photos: [
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80',
      'https://images.unsplash.com/photo-1604608672516-f1b9b1e8a8e4?w=800&q=80',
    ],
    rating: 4.5,
    entryFee: 'مجاني',
    accessible: true,
    openingHours: '9 صباحًا – 11 مساءً',
  },
  {
    id: '5',
    name: 'متحف صقر الجزيرة للطيران',
    nameEn: 'Saqr Al-Jazira Aviation Museum',
    district: 'حي الجنادرية',
    description:
      'يعرض تاريخ الطيران المدني والعسكري في المملكة، مع طائرات حقيقية معروضة في الهواء الطلق وقاعات تفاعلية لمحاكاة الطيران.',
    descriptionEn: 'Aviation history museum.',
    category: 'museum',
    lat: 24.9587,
    lng: 46.7214,
    image: '✈️',
    photos: [
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
      'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=800&q=80',
    ],
    rating: 4.3,
    entryFee: '15 ريال',
    accessible: true,
    openingHours: '8 صباحًا – 4 عصرًا',
  },
  {
    id: '6',
    name: 'قصر المربع التاريخي',
    nameEn: 'Murabba Palace',
    district: 'حي المربع',
    description:
      'القصر الذي بناه الملك عبدالعزيز عام 1937م مقرًا لحكمه وسكنه. يجمع بين العمارة النجدية التقليدية وعناصر حديثة، ويضم اليوم متحفًا.',
    descriptionEn: 'Historic palace of King Abdulaziz.',
    category: 'historical',
    lat: 24.6464,
    lng: 46.7102,
    image: '🏛️',
    photos: [
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
      'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&q=80',
    ],
    rating: 4.6,
    entryFee: 'مجاني',
    accessible: true,
    openingHours: '9 صباحًا – 8 مساءً',
  },
];

// Haversine distance in km
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const learnCategories = [
  {
    id: 'synonyms',
    title: 'المرادفات المحلية',
    titleEn: 'Local Synonyms',
    icon: '📝',
    color: 'heritage-gold',
    description: 'تعلم الكلمات الدارجة في نجد',
    descriptionEn: 'Learn colloquial words in Najd',
  },
  {
    id: 'proverbs',
    title: 'الأمثال الشعبية',
    titleEn: 'Folk Proverbs',
    icon: '💬',
    color: 'heritage-brown',
    description: 'أمثال وأحكام من التراث',
    descriptionEn: 'Proverbs and wisdom from heritage',
  },
  {
    id: 'stories',
    title: 'القصص التراثية',
    titleEn: 'Heritage Stories',
    icon: '📖',
    color: 'primary',
    description: 'حكايات وقصص من الماضي',
    descriptionEn: 'Tales and stories from the past',
  },
  {
    id: 'culture',
    title: 'التراث الثقافي',
    titleEn: 'Cultural Heritage',
    icon: '🎭',
    color: 'accent',
    description: 'عادات وتقاليد المنطقة',
    descriptionEn: 'Customs and traditions of the region',
  },
];
