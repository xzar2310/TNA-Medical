// Mock product catalog — replace with API calls when backend is ready
export interface MockProduct {
  id: string;
  sku: string;
  slug: string;
  name_en: string;
  name_th: string;
  description_en: string;
  price: number;
  compare_price: number;
  stock_qty: number;
  is_featured: boolean;
  fda_registration_number: string;
  category: string;
  imageUrl: string;
  ingredients: {
    name_en: string;
    name_th: string;
    amount: string;
    pubMedUrl?: string;
    description_en: string;
  }[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    sku: 'TNA-001',
    slug: 'vitamin-c-complex-1000mg',
    name_en: 'Vitamin C Complex 1000mg',
    name_th: 'วิตามินซี คอมเพล็กซ์ 1000 มก.',
    description_en: 'High-potency Vitamin C with Rose Hips extract for maximum absorption. Supports immune function, collagen synthesis, and antioxidant protection.',
    price: 890,
    compare_price: 1190,
    stock_qty: 150,
    is_featured: true,
    fda_registration_number: '10-1-01234-5-0001',
    category: 'Vitamins',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    ingredients: [
      { name_en: 'Ascorbic Acid', name_th: 'กรดแอสคอร์บิก', amount: '1000mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/23440782/', description_en: 'Essential vitamin for immune system function and collagen synthesis.' },
      { name_en: 'Rose Hips Extract', name_th: 'สารสกัดโรสฮิป', amount: '50mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/28085272/', description_en: 'Rich in natural bioflavonoids that enhance Vitamin C absorption.' },
    ],
  },
  {
    id: '2',
    sku: 'TNA-002',
    slug: 'omega-3-fish-oil-1000mg',
    name_en: 'Omega-3 Fish Oil 1000mg',
    name_th: 'โอเมก้า-3 น้ำมันปลา 1000 มก.',
    description_en: 'Premium deep-sea fish oil rich in EPA and DHA. Supports heart health, brain function, and reduces inflammation.',
    price: 1290,
    compare_price: 1690,
    stock_qty: 80,
    is_featured: true,
    fda_registration_number: '10-1-01234-5-0002',
    category: 'Heart Health',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80',
    ingredients: [
      { name_en: 'EPA (Eicosapentaenoic Acid)', name_th: 'EPA', amount: '180mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/25720716/', description_en: 'Supports cardiovascular health and reduces triglycerides.' },
      { name_en: 'DHA (Docosahexaenoic Acid)', name_th: 'DHA', amount: '120mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/22332096/', description_en: 'Essential for brain health and cognitive function.' },
    ],
  },
  {
    id: '3',
    sku: 'TNA-003',
    slug: 'collagen-tripeptide-10000mg',
    name_en: 'Marine Collagen Tripeptide 10,000mg',
    name_th: 'คอลลาเจน ไตรเปปไทด์ จากทะเล 10,000 มก.',
    description_en: 'Japanese-grade marine collagen tripeptide for skin elasticity, joint health, and anti-aging benefits.',
    price: 1890,
    compare_price: 2490,
    stock_qty: 60,
    is_featured: true,
    fda_registration_number: '10-1-01234-5-0003',
    category: 'Beauty & Skin',
    imageUrl: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80',
    ingredients: [
      { name_en: 'Marine Collagen Tripeptide', name_th: 'คอลลาเจนไตรเปปไทด์จากทะเล', amount: '10,000mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/27852613/', description_en: 'Low molecular weight collagen for superior skin absorption.' },
      { name_en: 'Vitamin C', name_th: 'วิตามินซี', amount: '60mg', description_en: 'Co-factor essential for collagen synthesis in the body.' },
    ],
  },
  {
    id: '4',
    sku: 'TNA-004',
    slug: 'zinc-plus-immune-support',
    name_en: 'Zinc Plus Immune Support 25mg',
    name_th: 'ซิงค์พลัส เสริมภูมิคุ้มกัน 25 มก.',
    description_en: 'High-absorption zinc picolinate combined with Elderberry and Echinacea for comprehensive immune defense.',
    price: 690,
    compare_price: 890,
    stock_qty: 200,
    is_featured: false,
    fda_registration_number: '10-1-01234-5-0004',
    category: 'Immune Support',
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80',
    ingredients: [
      { name_en: 'Zinc Picolinate', name_th: 'ซิงค์ไพโคลิเนต', amount: '25mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/22364157/', description_en: 'Highly bioavailable form of zinc for immune and enzymatic support.' },
      { name_en: 'Elderberry Extract', name_th: 'สารสกัดเอลเดอร์เบอร์รี่', amount: '200mg', description_en: 'Traditional herbal remedy for immune resilience.' },
    ],
  },
  {
    id: '5',
    sku: 'TNA-005',
    slug: 'magnesium-glycinate-400mg',
    name_en: 'Magnesium Glycinate 400mg',
    name_th: 'แมกนีเซียม ไกลซิเนต 400 มก.',
    description_en: 'Chelated magnesium glycinate for superior absorption. Supports muscle relaxation, sleep quality, and stress management.',
    price: 990,
    compare_price: 1290,
    stock_qty: 120,
    is_featured: false,
    fda_registration_number: '10-1-01234-5-0005',
    category: 'Sleep & Stress',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
    ingredients: [
      { name_en: 'Magnesium Glycinate', name_th: 'แมกนีเซียมไกลซิเนต', amount: '400mg', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/31932348/', description_en: 'Chelated form for maximum bioavailability with minimal laxative effect.' },
    ],
  },
  {
    id: '6',
    sku: 'TNA-006',
    slug: 'probiotic-30-billion-cfu',
    name_en: 'Advanced Probiotic 30 Billion CFU',
    name_th: 'โปรไบโอติก แอดวานซ์ 30 พันล้าน CFU',
    description_en: '10 scientifically-validated strains with 30 billion CFU per capsule. Supports gut microbiome, digestion, and immune health.',
    price: 1490,
    compare_price: 1890,
    stock_qty: 45,
    is_featured: true,
    fda_registration_number: '10-1-01234-5-0006',
    category: 'Gut Health',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    ingredients: [
      { name_en: 'Lactobacillus acidophilus', name_th: 'แลคโตบาซิลลัส แอซิโดฟิลัส', amount: '10B CFU', pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/28825726/', description_en: 'Primary probiotic strain for gut lining and immune modulation.' },
      { name_en: 'Bifidobacterium longum', name_th: 'บิฟิโดแบคทีเรียม ลองกัม', amount: '5B CFU', description_en: 'Supports bowel regularity and reduces digestive discomfort.' },
    ],
  },
];

export const CATEGORIES = ['All', 'Vitamins', 'Heart Health', 'Beauty & Skin', 'Immune Support', 'Sleep & Stress', 'Gut Health'];
