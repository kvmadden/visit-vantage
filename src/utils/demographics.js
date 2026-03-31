/**
 * Demographic context tags for Region 41 stores.
 * Based on Tampa Bay area geographic and demographic knowledge.
 * Tags: College Area, Retirement Community, Tourist Zone,
 *        High-Income Residential, Medical Corridor, Beach Community,
 *        Military Adjacent, Urban Core, Suburban
 */

// Zip-based demographic tagging for the Tampa Bay / SW Florida region
const ZIP_TAGS = {
  // Tampa urban core
  '33602': ['Urban Core'],
  '33603': ['Urban Core'],
  '33604': ['Urban Core'],
  '33605': ['Urban Core'],
  '33606': ['Urban Core', 'High-Income Residential', 'Medical Corridor'],
  '33607': ['Urban Core'],
  '33609': ['High-Income Residential'],
  '33610': ['Urban Core'],
  '33611': ['Urban Core'],
  '33612': ['Urban Core', 'Medical Corridor'],
  '33613': ['Urban Core', 'Medical Corridor'],
  '33614': ['Urban Core'],
  '33615': ['Suburban'],
  '33616': ['Military Adjacent'], // MacDill AFB area
  '33617': ['Suburban'],
  '33618': ['Suburban'],
  '33619': ['Suburban'],
  '33624': ['Suburban'],
  '33625': ['Suburban'],
  '33626': ['Suburban', 'High-Income Residential'],
  '33629': ['High-Income Residential'],
  '33634': ['Suburban'],
  '33635': ['Suburban'],
  '33647': ['Suburban', 'High-Income Residential'], // New Tampa

  // Clearwater / Pinellas
  '33755': ['Urban Core'],
  '33756': ['Urban Core'],
  '33759': ['Suburban'],
  '33760': ['Suburban'],
  '33761': ['Suburban'],
  '33763': ['Suburban'],
  '33764': ['Suburban'],
  '33765': ['Suburban'],
  '33767': ['Beach Community', 'Tourist Zone'], // Clearwater Beach

  // St. Petersburg
  '33701': ['Urban Core'],
  '33702': ['Suburban'],
  '33703': ['Suburban'],
  '33704': ['Urban Core'],
  '33705': ['Urban Core'],
  '33707': ['Suburban'],
  '33708': ['Beach Community'],
  '33709': ['Suburban'],
  '33710': ['Suburban'],
  '33711': ['Suburban'],
  '33712': ['Urban Core'],
  '33713': ['Suburban'],
  '33714': ['Suburban'],
  '33715': ['Beach Community', 'Retirement Community'], // South Pasadena
  '33716': ['Suburban'],

  // Beaches
  '33706': ['Beach Community', 'Tourist Zone'], // St Pete Beach
  '33785': ['Beach Community', 'Tourist Zone'], // Indian Rocks Beach
  '33770': ['Suburban'], // Largo
  '33771': ['Suburban'], // Largo
  '33772': ['Suburban'], // Seminole
  '33773': ['Suburban'], // Largo
  '33774': ['Beach Community'], // Seminole/Indian Shores
  '33776': ['Suburban'], // Seminole
  '33777': ['Suburban'], // Seminole
  '33778': ['Suburban'], // Largo

  // Pinellas north
  '34683': ['Suburban'], // Palm Harbor
  '34684': ['Suburban'], // Palm Harbor
  '34685': ['Suburban', 'High-Income Residential'], // Palm Harbor
  '34688': ['Suburban'], // Tarpon Springs
  '34689': ['Tourist Zone'], // Tarpon Springs - sponge docks
  '34690': ['Suburban'], // Holiday
  '34691': ['Suburban'], // Holiday
  '34695': ['Suburban'], // Safety Harbor

  // Dunedin
  '34698': ['Suburban', 'Tourist Zone'], // Dunedin

  // Brandon / Riverview / Valrico
  '33510': ['Suburban'], // Brandon
  '33511': ['Suburban'], // Brandon
  '33527': ['Suburban'], // Dover
  '33534': ['Suburban'], // Gibsonton
  '33547': ['Suburban', 'High-Income Residential'], // Lithia/FishHawk
  '33569': ['Suburban'], // Riverview
  '33578': ['Suburban'], // Riverview
  '33579': ['Suburban'], // Riverview
  '33584': ['Suburban'], // Seffner
  '33594': ['Suburban'], // Valrico
  '33596': ['Suburban'], // Valrico
  '33566': ['Suburban'], // Plant City
  '33563': ['Suburban'], // Plant City

  // Temple Terrace / USF area
  '33637': ['College Area'], // USF area
  '33620': ['College Area'], // USF campus

  // Sun City Center
  '33573': ['Retirement Community'], // Sun City Center
  '33598': ['Retirement Community'], // Wimauma/Sun City

  // Apollo Beach
  '33572': ['Suburban'],

  // Pasco County
  '33523': ['Suburban'], // Dade City
  '33525': ['Suburban'], // Dade City
  '33540': ['Suburban'], // Zephyrhills
  '33541': ['Suburban', 'Retirement Community'], // Zephyrhills
  '33542': ['Suburban'], // Zephyrhills
  '33543': ['Suburban'], // Wesley Chapel
  '33544': ['Suburban'], // Wesley Chapel
  '33545': ['Suburban'], // Wesley Chapel
  '33548': ['Suburban', 'High-Income Residential'], // Lutz
  '33549': ['Suburban'], // Lutz
  '33556': ['Suburban', 'High-Income Residential'], // Odessa
  '33558': ['Suburban'], // Lutz

  // New Port Richey / Hudson / Spring Hill
  '34652': ['Suburban'], // New Port Richey
  '34653': ['Suburban'], // New Port Richey
  '34654': ['Suburban'], // New Port Richey
  '34655': ['Suburban'], // New Port Richey
  '34667': ['Suburban'], // Hudson
  '34668': ['Suburban'], // Port Richey
  '34669': ['Suburban'], // Hudson

  // Hernando County
  '34601': ['Suburban'], // Brooksville
  '34602': ['Suburban'], // Brooksville
  '34606': ['Suburban'], // Spring Hill
  '34607': ['Suburban', 'Tourist Zone'], // Spring Hill / Weeki Wachee
  '34608': ['Suburban'], // Spring Hill
  '34609': ['Suburban'], // Spring Hill
  '34613': ['Suburban'], // Brooksville
  '34614': ['Suburban'], // Brooksville

  // Bradenton / Manatee
  '34201': ['Suburban'], // Bradenton
  '34202': ['Suburban', 'High-Income Residential'], // Bradenton/Lakewood Ranch
  '34203': ['Suburban'], // Bradenton
  '34205': ['Urban Core'], // Bradenton
  '34207': ['Suburban'], // Bradenton
  '34208': ['Suburban'], // Bradenton
  '34209': ['Beach Community', 'Tourist Zone'], // Anna Maria/Holmes Beach
  '34210': ['Suburban'], // Bradenton
  '34211': ['Suburban', 'High-Income Residential'], // Bradenton/Lakewood Ranch
  '34212': ['Suburban', 'High-Income Residential'], // Lakewood Ranch
  '34215': ['Beach Community'], // Cortez
  '34217': ['Beach Community', 'Tourist Zone'], // Bradenton Beach
  '34219': ['Suburban'], // Parrish
  '34221': ['Suburban'], // Palmetto
  '34222': ['Suburban'], // Ellenton

  // Sarasota
  '34229': ['Beach Community', 'High-Income Residential'], // Osprey
  '34231': ['Suburban'], // Sarasota
  '34232': ['Suburban'], // Sarasota
  '34233': ['Suburban'], // Sarasota
  '34234': ['Urban Core'], // Sarasota
  '34235': ['Suburban'], // Sarasota
  '34236': ['Urban Core', 'Tourist Zone'], // Sarasota downtown / St. Armands
  '34237': ['Suburban'], // Sarasota
  '34238': ['Suburban', 'High-Income Residential'], // Sarasota
  '34239': ['High-Income Residential'], // Sarasota
  '34240': ['Suburban'], // Sarasota
  '34241': ['Suburban'], // Sarasota
  '34242': ['Beach Community', 'High-Income Residential'], // Siesta Key / Lido
  '34243': ['Suburban'], // University Park

  // Longboat Key
  '34228': ['Beach Community', 'High-Income Residential', 'Tourist Zone'],

  // Venice / Nokomis
  '34275': ['Retirement Community'], // Nokomis
  '34285': ['Retirement Community'], // Venice
  '34286': ['Suburban'], // North Port / Venice
  '34287': ['Suburban'], // North Port
  '34288': ['Suburban'], // North Port
  '34289': ['Suburban'], // North Port
  '34292': ['Retirement Community'], // Venice
  '34293': ['Beach Community', 'Retirement Community'], // Venice

  // Englewood
  '34223': ['Retirement Community', 'Beach Community'], // Englewood
  '34224': ['Beach Community'], // Englewood

  // Port Charlotte / Punta Gorda
  '33948': ['Retirement Community'], // Port Charlotte
  '33950': ['Retirement Community'], // Punta Gorda
  '33952': ['Retirement Community'], // Port Charlotte
  '33953': ['Suburban'], // Port Charlotte
  '33954': ['Suburban'], // Port Charlotte
  '33980': ['Retirement Community'], // Port Charlotte
  '33981': ['Suburban'], // Port Charlotte
  '33982': ['Suburban'], // Port Charlotte
  '33983': ['Suburban'], // Port Charlotte
};

// City-based fallback tags
const CITY_TAGS = {
  'Sun City Center': ['Retirement Community'],
  'Clearwater Beach': ['Beach Community', 'Tourist Zone'],
  'Madeira Beach': ['Beach Community', 'Tourist Zone'],
  'South Pasadena': ['Retirement Community'],
  'Holmes Beach': ['Beach Community', 'Tourist Zone'],
  'Longboat Key': ['Beach Community', 'High-Income Residential'],
  'Venice': ['Retirement Community'],
  'Englewood': ['Retirement Community'],
  'Port Charlotte': ['Retirement Community'],
  'Punta Gorda': ['Retirement Community'],
  'Nokomis': ['Retirement Community'],
  'North Port': ['Suburban'],
  'Osprey': ['High-Income Residential'],
  'Dunedin': ['Tourist Zone'],
  'Tarpon Springs': ['Tourist Zone'],
  'University Park': ['High-Income Residential'],
};

/**
 * Get demographic context tags for a store.
 * Returns an array of tag strings.
 */
export function getDemoTags(store) {
  const tags = new Set();

  // Zip-based tags
  const zipTags = ZIP_TAGS[store.zip];
  if (zipTags) {
    zipTags.forEach((t) => tags.add(t));
  }

  // City-based fallback
  const cityTags = CITY_TAGS[store.city];
  if (cityTags) {
    cityTags.forEach((t) => tags.add(t));
  }

  // If no tags found, default to Suburban
  if (tags.size === 0) {
    tags.add('Suburban');
  }

  return Array.from(tags);
}
