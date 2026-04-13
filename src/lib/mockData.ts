export interface CulturalPlace {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: 'museum' | 'heritage' | 'historical';
  lat: number;
  lng: number;
  image: string;
  rating: number;
}

export const culturalPlaces: CulturalPlace[] = [
  {
    id: '1',
    name: 'المتحف الوطني السعودي',
    nameEn: 'Saudi National Museum',
    description: 'أكبر متحف في المملكة العربية السعودية، يروي قصة الجزيرة العربية من العصور القديمة حتى العصر الحديث.',
    descriptionEn: 'The largest museum in Saudi Arabia, telling the story of the Arabian Peninsula from ancient times to the modern era.',
    category: 'museum',
    lat: 24.6311,
    lng: 46.7131,
    image: '🏛️',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'حي الطريف التاريخي',
    nameEn: 'At-Turaif District',
    description: 'موقع تراث عالمي لليونسكو، كان مقراً لأسرة آل سعود ومهد الدولة السعودية الأولى.',
    descriptionEn: 'A UNESCO World Heritage Site, former seat of the Saudi dynasty and birthplace of the First Saudi State.',
    category: 'heritage',
    lat: 24.7342,
    lng: 46.5727,
    image: '🏰',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'قصر المصمك',
    nameEn: 'Masmak Fortress',
    description: 'حصن تاريخي شهد استعادة الرياض على يد الملك عبدالعزيز عام 1902م.',
    descriptionEn: 'A historic fortress that witnessed the recapture of Riyadh by King Abdulaziz in 1902.',
    category: 'historical',
    lat: 24.6310,
    lng: 46.7135,
    image: '🏯',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'سوق الزل',
    nameEn: 'Souq Al-Zal',
    description: 'سوق شعبي تقليدي في قلب الرياض القديمة، يعرض المشغولات اليدوية والأزياء التراثية.',
    descriptionEn: 'A traditional folk market in old Riyadh, featuring handicrafts and traditional clothing.',
    category: 'heritage',
    lat: 24.6315,
    lng: 46.7110,
    image: '🏪',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'متحف صقر الجزيرة للطيران',
    nameEn: 'Saqr Al-Jazira Aviation Museum',
    description: 'يعرض تاريخ الطيران في المملكة العربية السعودية من بداياته حتى الوقت الحاضر.',
    descriptionEn: 'Showcases the history of aviation in Saudi Arabia from its beginnings to the present.',
    category: 'museum',
    lat: 24.7207,
    lng: 46.6396,
    image: '✈️',
    rating: 4.3,
  },
  {
    id: '6',
    name: 'قرية أشيقر التراثية',
    nameEn: 'Ushaiger Heritage Village',
    description: 'قرية تراثية تعود لأكثر من 400 عام، تعكس العمارة النجدية الأصيلة.',
    descriptionEn: 'A heritage village over 400 years old, reflecting authentic Najdi architecture.',
    category: 'heritage',
    lat: 25.3284,
    lng: 45.2056,
    image: '🏘️',
    rating: 4.6,
  },
];

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
    id: 'poetry',
    title: 'الشعر النجدي',
    titleEn: 'Najdi Poetry',
    icon: '📜',
    color: 'heritage-terracotta',
    description: 'أبيات شعرية من التراث النجدي',
    descriptionEn: 'Poetry from Najdi heritage',
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
