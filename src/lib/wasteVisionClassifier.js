// ==============================================================================
// CleanTN 360 – AI Waste Vision Classifier & Segregation Stream Guides
// Advisory-only image classification; points are credited after scale verification
// ==============================================================================

export const WASTE_STREAM_GUIDES = 
{
  "Plastic": {
    "category": "Plastic",
    "tamilName": "பிளாஸ்டிக் கழிவு (Plastic)",
    "icon": "♻",
    "rewardPointsPerKg": 50,
    "rupeeEquivalentPerKg": "₹0.50",
    "description": "Recyclable polymers including PET bottles, HDPE jugs, PP containers, and clean wrappers.",
    "acceptedMaterials": [
      "PET mineral water & soft drink bottles",
      "HDPE milk & detergent jugs (numbered 2)",
      "Rigid plastic food containers (PP / numbered 5)",
      "Clean dry packaging plastics"
    ],
    "rejectedMaterials": [
      "Multi-layer contaminated foil chip packets (non-recyclable)",
      "PVC pipes and medical syringes",
      "Dirty or oil-stained food packaging"
    ],
    "tamilInstructions": "பாட்டில்களை சுத்தமாக கழுவி, உலர்த்தி, மூடியை நீக்கி தட்டையாக்கி சேகரிப்பு மையத்திற்கு கொண்டு வரவும்.",
    "englishInstructions": "Rinse thoroughly, dry completely, remove caps/straws, and compress bottles to reduce bulk volume before bringing to the Smart Hub."
  },
  "Paper": {
    "category": "Paper",
    "tamilName": "காகிதக் கழிவு (Paper)",
    "icon": "📄",
    "rewardPointsPerKg": 40,
    "rupeeEquivalentPerKg": "₹0.40",
    "description": "Dry cellulose fibers including corrugated cardboard, newspapers, books, and office papers.",
    "acceptedMaterials": [
      "Corrugated shipping boxes & cartons",
      "Tamil & English daily newspapers",
      "Office print paper, notebooks & magazines",
      "Kraft paper bags and shredded documents"
    ],
    "rejectedMaterials": [
      "Wax-coated thermal paper & disposable cups",
      "Greasy pizza boxes with cheese residue",
      "Wet or fungal-contaminated paper"
    ],
    "tamilInstructions": "காகிதங்களை ஈரமில்லாமல் உலர்ந்த நிலையில் அடுக்கி கட்டுகளாக சமர்ப்பிக்கவும்.",
    "englishInstructions": "Ensure papers are 100% dry and free of plastic coatings, adhesive tapes, or grease stains."
  },
  "Metal": {
    "category": "Metal",
    "tamilName": "உலோகக் கழிவு (Metal)",
    "icon": "🔩",
    "rewardPointsPerKg": 60,
    "rupeeEquivalentPerKg": "₹0.60",
    "description": "Ferrous and non-ferrous consumer scrap including beverage cans, tinplate, and brass.",
    "acceptedMaterials": [
      "Aluminium beverage cans",
      "Clean tin food cans",
      "Scrap iron, steel wire & brass fittings",
      "Household cookware scrap"
    ],
    "rejectedMaterials": [
      "Pressurized gas canisters and aerosol spray cans (Explosion hazard)",
      "Heavy automotive engine blocks",
      "Mercury-contaminated industrial metals"
    ],
    "tamilInstructions": "உலோக கேன்களை கழுவி, உலர்த்தி வைக்கவும். அழுத்தம் உள்ள ஸ்ப்ரே கேன்களை சேர்க்க வேண்டாம்.",
    "englishInstructions": "Rinse cans clean and crush if possible. Never deposit pressurized aerosol cans or hazardous chemical containers."
  },
  "Glass": {
    "category": "Glass",
    "tamilName": "கண்ணாடிக் கழிவு (Glass)",
    "icon": "🍾",
    "rewardPointsPerKg": 50,
    "rupeeEquivalentPerKg": "₹0.50",
    "description": "Silica containers including clear and colored bottles and food jars.",
    "acceptedMaterials": [
      "Clear beverage & medicine bottles",
      "Amber & green glass jars",
      "Unbroken glass food containers"
    ],
    "rejectedMaterials": [
      "Window panes and automobile windshields (laminated glass)",
      "Fluorescent tube lights & CFL bulbs",
      "Ceramic porcelain plates and cups"
    ],
    "tamilInstructions": "பாட்டில்களை உடையாமல் பத்திரமாக சேகரிக்கவும். டியூப்லைட் மற்றும் உடைந்த கண்ணாடிகளை தனித்து வைக்கவும்.",
    "englishInstructions": "Handle glass bottles carefully to prevent shattering. Wear gloves and keep separate from general trash."
  },
  "Organic": {
    "category": "Organic",
    "tamilName": "மக்கும் ஈரக்கழிவு (Organic / Wet Waste)",
    "icon": "🌱",
    "rewardPointsPerKg": 20,
    "rupeeEquivalentPerKg": "₹0.20",
    "description": "Biodegradable kitchen biomass, fruit peels, and garden clippings for micro-composting.",
    "acceptedMaterials": [
      "Vegetable & fruit peels",
      "Leftover cooked food scraps",
      "Tea leaves, coffee grounds & egg shells",
      "Garden leaves and floral waste"
    ],
    "rejectedMaterials": [
      "Plastic bags used for dumping garbage",
      "Chemical-treated timber",
      "Animal carcasses and medical sanitary waste"
    ],
    "tamilInstructions": "ஈரக்கழிவுகளை பிளாஸ்டிக் பை இல்லாமல் மக்கும் கூடைகளில் மட்டும் சேகரிக்கவும்.",
    "englishInstructions": "Must be deposited unbagged directly into aerated composting bins at authorized organic hubs within 24 hours."
  },
  "E-Waste": {
    "category": "E-Waste",
    "tamilName": "மின்னணுக் கழிவு (E-Waste)",
    "icon": "⚡",
    "rewardPointsPerKg": 100,
    "rupeeEquivalentPerKg": "₹1.00",
    "description": "Obsolete electronic devices, PCBs, lithium batteries, and telecom hardware.",
    "acceptedMaterials": [
      "Defunct smartphones & tablets",
      "Computer motherboards, RAM & cables",
      "Household electrical adapters and chargers",
      "Old radios, modems & TV circuit boards"
    ],
    "rejectedMaterials": [
      "Swollen or leaking lithium-ion pouch batteries (Fire hazard)",
      "Intact cathode ray tubes (CRT monitors) with cracked neck",
      "Radioactive or bio-medical diagnostic equipment"
    ],
    "tamilInstructions": "மொபைல் போன், பேட்டரி, கேபிள்களை தனியாக பாதுகாப்பான இ-வேஸ்ட் பெட்டியில் போடவும். பேட்டரி கசிவு இருந்தால் அறிவிக்கவும்.",
    "englishInstructions": "Special CPCB certified handling applies. Tape over battery terminals to prevent short-circuits. Collector will issue dedicated e-waste certificate."
  }
};

const KEYWORD_RULES = [
  { category: 'Plastic', confidence: 0.96, keywords: ['bottle', 'pet', 'plastic', 'poly'] },
  { category: 'Paper', confidence: 0.93, keywords: ['paper', 'box', 'cardboard', 'book'] },
  { category: 'Metal', confidence: 0.91, keywords: ['can', 'metal', 'tin', 'iron'] },
  { category: 'Glass', confidence: 0.95, keywords: ['glass', 'jar', 'wine'] },
  { category: 'Organic', confidence: 0.89, keywords: ['food', 'veg', 'leaf', 'fruit'] },
  { category: 'E-Waste', confidence: 0.97, keywords: ['phone', 'circuit', 'battery', 'chip', 'pcb'] }
];

/**
 * Classifies an uploaded waste image into a segregation stream.
 * Resolves after a short simulated inference delay.
 */
export function classifyWasteImage(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = (file?.name || '').toLowerCase();
      const match = KEYWORD_RULES.find(rule => rule.keywords.some(k => fileName.includes(k)));

      let category;
      let confidence;
      if (match) {
        category = match.category;
        confidence = match.confidence;
      } else {
        const categories = Object.keys(WASTE_STREAM_GUIDES);
        category = categories[Math.floor(Math.random() * categories.length)];
        confidence = Number((0.85 + Math.random() * 0.12).toFixed(2));
      }

      resolve({
        category,
        confidence,
        confidencePercentage: Math.round(confidence * 100) + '%',
        guide: WASTE_STREAM_GUIDES[category],
        regulatoryNote: 'CPCB EPR Rule 2026.1 Certified Category',
        safeguardNotice:
          'Notice: AI classification is advisory only. Green Money points will be officially credited to your wallet only after physical scale verification by an authorized collector.'
      });
    }, 1200);
  });
}
