// ====================================================================
// CLEANTN 360 - ENVIRONMENTAL IMPACT & EMISSION FACTORS (PHASE 4)
// Documented conversion coefficients based on Central Pollution Control
// Board (CPCB) India, IPCC Solid Waste guidelines, and EPA WARM v15.
// ====================================================================

export const ENVIRONMENTAL_FACTORS = {
  version: '2026.1-CPCB-TN',
  lastUpdated: '2026-11-16',
  authority: 'CPCB & Tamil Nadu Pollution Control Board (TNPCB) Reference Standards',
  categories: {
    Plastic: {
      category: 'Plastic',
      co2OffsetPerKg: 1.5, // kg CO2 equivalent avoided per kg recycled (CPCB Plastic Waste Management Rules 2016/2022)
      landfillVolumeSavedM3PerKg: 0.0022, // m3 landfill space preserved per kg recycled
      rawMaterialSavedKgPerKg: 1.2, // Virgin resin / crude polymer conserved
      energySavedKwhPerKg: 2.5, // Energy savings vs virgin HDPE/PET manufacture
      waterSavedLitersPerKg: 10.0,
      source: 'Central Pollution Control Board (CPCB) - Guidelines on EPR for Plastic Waste',
      methodology: 'Avoided production of virgin fossil-based polymer resins through mechanical recycling loop.'
    },
    Paper: {
      category: 'Paper',
      co2OffsetPerKg: 1.1, // kg CO2e avoided per kg paper recycled (EPA WARM / CPCB)
      landfillVolumeSavedM3PerKg: 0.0018,
      rawMaterialSavedKgPerKg: 1.0, // Virgin wood pulp conserved
      treesSavedPerKg: 0.017, // ~17 trees per 1,000 kg (1 ton) recycled paper pulp
      waterSavedLitersPerKg: 26.0, // Water conserved compared to chemical wood pulping
      energySavedKwhPerKg: 1.8,
      source: 'Indian Paper Manufacturers Association (IPMA) & CPCB Circular Economy Report',
      methodology: 'Reduction of virgin logging, chemical kraft digestion, and anaerobic landfill decomposition.'
    },
    Metal: {
      category: 'Metal',
      co2OffsetPerKg: 2.0, // kg CO2e avoided per kg scrap steel/aluminum recycled (Bureau of International Recycling)
      landfillVolumeSavedM3PerKg: 0.0008,
      rawMaterialSavedKgPerKg: 1.4, // Iron ore, bauxite and metallurgical coal conserved
      energySavedKwhPerKg: 6.2, // ~95% energy conserved for aluminum; ~70% for steel scrap
      waterSavedLitersPerKg: 15.0,
      source: 'Ministry of Steel (India) Scrap Recycling Policy & BIR LCA Database',
      methodology: 'Direct substitution of blast furnace iron/bauxite smelting with electric arc secondary remelting.'
    },
    Glass: {
      category: 'Glass',
      co2OffsetPerKg: 0.31, // kg CO2e avoided per kg cullet melted
      landfillVolumeSavedM3PerKg: 0.0007,
      rawMaterialSavedKgPerKg: 1.2, // Silica sand, soda ash, and limestone conserved
      energySavedKwhPerKg: 0.45, // Melting point lowered by 20% using cullet
      waterSavedLitersPerKg: 2.5,
      source: 'Federation of Indian Glass Manufacturers & European Container Glass Federation (FEVE)',
      methodology: 'Closed-loop cullet remelting lowering furnace temperatures and preventing carbonate emissions.'
    },
    Organic: {
      category: 'Organic',
      co2OffsetPerKg: 0.52, // kg CO2e avoided per kg wet waste composted vs anaerobic landfill methane release
      landfillVolumeSavedM3PerKg: 0.0015,
      compostProducedKgPerKg: 0.35, // High-nutrient soil conditioner produced
      energySavedKwhPerKg: 0.2,
      waterSavedLitersPerKg: 4.0,
      source: 'Swachh Bharat Mission (Urban) Solid Waste Management Manual & IPCC Tier 1',
      methodology: 'Aerobic composting preventing anaerobic methanogenesis (Global Warming Potential 28x CO2).'
    },
    'E-Waste': {
      category: 'E-Waste',
      co2OffsetPerKg: 3.2, // kg CO2e avoided per kg e-waste treated by authorized recyclers
      landfillVolumeSavedM3PerKg: 0.0012,
      rawMaterialSavedKgPerKg: 0.8, // Precious metals (Cu, Au, Ag, rare earths) recovered
      toxicHeavyMetalsDivertedGramsPerKg: 15.0, // Lead, mercury, cadmium prevented from leaching into groundwater
      energySavedKwhPerKg: 9.5,
      source: 'E-Waste (Management) Rules 2022 & CPCB Technical Guidelines for Authorized Dismantlers',
      methodology: 'Hydrometallurgical extraction and urban mining replacing virgin open-cast mineral extraction.'
    }
  }
};

/**
 * Calculates deterministic environmental impact indicators for given verified waste weights.
 * @param {Array<{category_name: string, actual_weight_kg: number, weight_kg: number}>} approvedDeposits
 * @returns {Object} Comprehensive environmental indicators with transparent methodology notes.
 */
export function calculateEnvironmentalImpact(approvedDeposits = []) {
  let totalWeightKg = 0;
  let totalCo2OffsetKg = 0;
  let totalLandfillSavedM3 = 0;
  let totalTreesSaved = 0;
  let totalWaterSavedLiters = 0;
  let totalEnergySavedKwh = 0;

  const categoryBreakdown = {};

  Object.keys(ENVIRONMENTAL_FACTORS.categories).forEach((catKey) => {
    categoryBreakdown[catKey] = {
      weightKg: 0,
      co2Kg: 0,
      landfillM3: 0,
      trees: 0,
      waterLiters: 0
    };
  });

  approvedDeposits.forEach((dep) => {
    const weight = Number(dep.actual_weight_kg) || Number(dep.weight_kg) || 0;
    if (weight <= 0) return;

    totalWeightKg += weight;

    // Match category
    let matchedFactor = null;
    const catName = (dep.category_name || '').toLowerCase();
    for (const [key, factor] of Object.entries(ENVIRONMENTAL_FACTORS.categories)) {
      if (catName.includes(key.toLowerCase())) {
        matchedFactor = factor;
        categoryBreakdown[key].weightKg += weight;
        break;
      }
    }

    if (matchedFactor) {
      const co2 = weight * (matchedFactor.co2OffsetPerKg || 0);
      const m3 = weight * (matchedFactor.landfillVolumeSavedM3PerKg || 0);
      const trees = weight * (matchedFactor.treesSavedPerKg || 0);
      const water = weight * (matchedFactor.waterSavedLitersPerKg || 0);
      const energy = weight * (matchedFactor.energySavedKwhPerKg || 0);

      totalCo2OffsetKg += co2;
      totalLandfillSavedM3 += m3;
      totalTreesSaved += trees;
      totalWaterSavedLiters += water;
      totalEnergySavedKwh += energy;

      const catKey = matchedFactor.category;
      if (categoryBreakdown[catKey]) {
        categoryBreakdown[catKey].co2Kg += co2;
        categoryBreakdown[catKey].landfillM3 += m3;
        categoryBreakdown[catKey].trees += trees;
        categoryBreakdown[catKey].waterLiters += water;
      }
    }
  });

  return {
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    totalCo2OffsetKg: Number(totalCo2OffsetKg.toFixed(2)),
    totalCo2OffsetTons: Number((totalCo2OffsetKg / 1000).toFixed(3)),
    totalLandfillSavedM3: Number(totalLandfillSavedM3.toFixed(3)),
    totalTreesSaved: Number(totalTreesSaved.toFixed(2)),
    totalWaterSavedLiters: Math.round(totalWaterSavedLiters),
    totalEnergySavedKwh: Number(totalEnergySavedKwh.toFixed(1)),
    categoryBreakdown,
    authority: ENVIRONMENTAL_FACTORS.authority,
    version: ENVIRONMENTAL_FACTORS.version
  };
}
