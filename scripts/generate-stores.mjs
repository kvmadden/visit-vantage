import { writeFileSync } from 'fs';

const ZIP_DATA = {
  '33756': { lat: 27.9659, lng: -82.8001, city: 'Clearwater' },
  '33755': { lat: 27.9758, lng: -82.7847, city: 'Clearwater' },
  '33763': { lat: 28.0089, lng: -82.7444, city: 'Clearwater' },
  '33764': { lat: 27.9497, lng: -82.7397, city: 'Clearwater' },
  '33765': { lat: 27.9669, lng: -82.7556, city: 'Clearwater' },
  '33767': { lat: 27.9781, lng: -82.8264, city: 'Clearwater Beach' },
  '33770': { lat: 27.9094, lng: -82.7725, city: 'Largo' },
  '33771': { lat: 27.9033, lng: -82.7436, city: 'Largo' },
  '33773': { lat: 27.8728, lng: -82.7519, city: 'Largo' },
  '33774': { lat: 27.8781, lng: -82.7903, city: 'Largo' },
  '33776': { lat: 27.8503, lng: -82.7822, city: 'Seminole' },
  '33777': { lat: 27.8403, lng: -82.7900, city: 'Seminole' },
  '33781': { lat: 27.8428, lng: -82.6992, city: 'Pinellas Park' },
  '33782': { lat: 27.8592, lng: -82.7194, city: 'Pinellas Park' },
  '33701': { lat: 27.7706, lng: -82.6375, city: 'St. Petersburg' },
  '33702': { lat: 27.8233, lng: -82.6303, city: 'St. Petersburg' },
  '33703': { lat: 27.8094, lng: -82.6114, city: 'St. Petersburg' },
  '33704': { lat: 27.7975, lng: -82.6364, city: 'St. Petersburg' },
  '33705': { lat: 27.7592, lng: -82.6319, city: 'St. Petersburg' },
  '33710': { lat: 27.8006, lng: -82.6933, city: 'St. Petersburg' },
  '33711': { lat: 27.7472, lng: -82.6814, city: 'St. Petersburg' },
  '33712': { lat: 27.7356, lng: -82.6544, city: 'St. Petersburg' },
  '33713': { lat: 27.7817, lng: -82.6703, city: 'St. Petersburg' },
  '33714': { lat: 27.8072, lng: -82.6764, city: 'St. Petersburg' },
  '33716': { lat: 27.8547, lng: -82.6194, city: 'St. Petersburg' },
  '33706': { lat: 27.7322, lng: -82.6647, city: 'St. Pete Beach' },
  '33707': { lat: 27.7553, lng: -82.7381, city: 'South Pasadena' },
  '33708': { lat: 27.7897, lng: -82.7558, city: 'Madeira Beach' },
  '33709': { lat: 27.8156, lng: -82.7117, city: 'St. Petersburg' },
  '33602': { lat: 27.9506, lng: -82.4572, city: 'Tampa' },
  '33603': { lat: 27.9717, lng: -82.4633, city: 'Tampa' },
  '33604': { lat: 27.9847, lng: -82.4514, city: 'Tampa' },
  '33605': { lat: 27.9597, lng: -82.4348, city: 'Tampa' },
  '33606': { lat: 27.9311, lng: -82.4625, city: 'Tampa' },
  '33607': { lat: 27.9583, lng: -82.5064, city: 'Tampa' },
  '33609': { lat: 27.9294, lng: -82.5019, city: 'Tampa' },
  '33610': { lat: 27.9847, lng: -82.3903, city: 'Tampa' },
  '33611': { lat: 27.8928, lng: -82.5097, city: 'Tampa' },
  '33612': { lat: 28.0169, lng: -82.4508, city: 'Tampa' },
  '33613': { lat: 28.0389, lng: -82.4542, city: 'Tampa' },
  '33614': { lat: 27.9861, lng: -82.5103, city: 'Tampa' },
  '33615': { lat: 27.9711, lng: -82.5753, city: 'Tampa' },
  '33616': { lat: 27.8753, lng: -82.4858, city: 'Tampa' },
  '33617': { lat: 28.0011, lng: -82.3908, city: 'Tampa' },
  '33618': { lat: 28.0403, lng: -82.5058, city: 'Tampa' },
  '33619': { lat: 27.9317, lng: -82.3561, city: 'Tampa' },
  '33624': { lat: 28.0603, lng: -82.5353, city: 'Tampa' },
  '33625': { lat: 28.0642, lng: -82.5728, city: 'Tampa' },
  '33626': { lat: 28.0642, lng: -82.6114, city: 'Tampa' },
  '33629': { lat: 27.9178, lng: -82.5228, city: 'Tampa' },
  '33634': { lat: 27.9717, lng: -82.5442, city: 'Tampa' },
  '33635': { lat: 27.9792, lng: -82.5933, city: 'Tampa' },
  '33647': { lat: 28.1017, lng: -82.3625, city: 'Tampa' },
  '33549': { lat: 28.1425, lng: -82.4503, city: 'Lutz' },
  '33548': { lat: 28.1486, lng: -82.4978, city: 'Lutz' },
  '33558': { lat: 28.1200, lng: -82.5200, city: 'Lutz' },
  '33559': { lat: 28.1500, lng: -82.4300, city: 'Lutz' },
  '33556': { lat: 28.1536, lng: -82.5661, city: 'Odessa' },
  '33544': { lat: 28.2258, lng: -82.3325, city: 'Wesley Chapel' },
  '33543': { lat: 28.1947, lng: -82.3422, city: 'Wesley Chapel' },
  '33510': { lat: 27.9308, lng: -82.2856, city: 'Brandon' },
  '33511': { lat: 27.9028, lng: -82.3064, city: 'Brandon' },
  '33534': { lat: 27.8397, lng: -82.3681, city: 'Gibsonton' },
  '33569': { lat: 27.8208, lng: -82.3192, city: 'Riverview' },
  '33578': { lat: 27.8494, lng: -82.3125, city: 'Riverview' },
  '33579': { lat: 27.7911, lng: -82.2933, city: 'Riverview' },
  '33584': { lat: 28.0036, lng: -82.2811, city: 'Seffner' },
  '33594': { lat: 27.9394, lng: -82.2328, city: 'Valrico' },
  '33596': { lat: 27.9639, lng: -82.2044, city: 'Valrico' },
  '33566': { lat: 27.8919, lng: -82.1294, city: 'Plant City' },
  '33563': { lat: 28.0133, lng: -82.1194, city: 'Plant City' },
  '33572': { lat: 27.7139, lng: -82.3536, city: 'Sun City Center' },
  '33570': { lat: 27.7208, lng: -82.4314, city: 'Ruskin' },
  '34205': { lat: 27.4953, lng: -82.5797, city: 'Bradenton' },
  '34207': { lat: 27.4653, lng: -82.5469, city: 'Bradenton' },
  '34208': { lat: 27.4897, lng: -82.5072, city: 'Bradenton' },
  '34209': { lat: 27.5050, lng: -82.6144, city: 'Bradenton' },
  '34210': { lat: 27.4347, lng: -82.5925, city: 'Bradenton' },
  '34211': { lat: 27.4428, lng: -82.4608, city: 'Lakewood Ranch' },
  '34212': { lat: 27.4564, lng: -82.4136, city: 'Lakewood Ranch' },
  '34221': { lat: 27.5242, lng: -82.5703, city: 'Palmetto' },
  '34222': { lat: 27.5289, lng: -82.5136, city: 'Ellenton' },
  '34231': { lat: 27.2956, lng: -82.5308, city: 'Sarasota' },
  '34232': { lat: 27.3078, lng: -82.4914, city: 'Sarasota' },
  '34233': { lat: 27.2789, lng: -82.5058, city: 'Sarasota' },
  '34234': { lat: 27.3464, lng: -82.5314, city: 'Sarasota' },
  '34235': { lat: 27.3528, lng: -82.5003, city: 'Sarasota' },
  '34236': { lat: 27.3319, lng: -82.5497, city: 'Sarasota' },
  '34237': { lat: 27.3389, lng: -82.5169, city: 'Sarasota' },
  '34238': { lat: 27.2589, lng: -82.4886, city: 'Sarasota' },
  '34239': { lat: 27.3186, lng: -82.5106, city: 'Sarasota' },
  '34240': { lat: 27.3136, lng: -82.4425, city: 'Sarasota' },
  '34243': { lat: 27.3886, lng: -82.5144, city: 'University Park' },
  '34285': { lat: 27.0986, lng: -82.4531, city: 'Venice' },
  '34292': { lat: 27.0539, lng: -82.3981, city: 'Venice' },
  '34275': { lat: 27.1672, lng: -82.4578, city: 'Nokomis' },
  '34293': { lat: 27.0972, lng: -82.4319, city: 'North Port' },
  '33759': { lat: 27.9886, lng: -82.7553, city: 'Clearwater' },
  '33760': { lat: 27.9053, lng: -82.7136, city: 'Clearwater' },
  '33761': { lat: 27.9208, lng: -82.7267, city: 'Clearwater' },
  '34689': { lat: 28.0539, lng: -82.7642, city: 'Tarpon Springs' },
  '34683': { lat: 28.0878, lng: -82.7542, city: 'Palm Harbor' },
  '34684': { lat: 28.0789, lng: -82.7186, city: 'Palm Harbor' },
  '34695': { lat: 28.0158, lng: -82.6919, city: 'Safety Harbor' },
  '34677': { lat: 28.0339, lng: -82.6628, city: 'Oldsmar' },
  '34698': { lat: 28.0156, lng: -82.7706, city: 'Dunedin' },
};

// Rx district assignments by geographic area
const RX_DISTRICT_ZIPS = {
  20: ['33756','33755','33763','33764','33765','33767','33759','33760','33761','34689','34683','34684','34695','34677','34698'], // N Pinellas/Clearwater
  21: ['33701','33702','33703','33704','33705','33706','33707','33708','33709','33710','33711','33712','33713','33714','33716'], // S Pinellas/St Pete
  22: ['33612','33613','33617','33618','33624','33625','33626','33647','33549','33548','33558','33559','33556','33544','33543'], // N Tampa/Lutz/Wesley Chapel
  23: ['33602','33603','33604','33605','33606','33607','33609','33614','33615','33634','33635','33629'], // Central Tampa
  24: ['33510','33511','33610','33611','33616','33619','33584','33594','33596','33566','33563'], // S Tampa/Brandon
  25: ['33534','33569','33578','33579','33572','33570'], // Riverview/Gibsonton/Ruskin
  26: ['34205','34207','34208','34209','34210','34211','34212','34221','34222','34243'], // Bradenton/Palmetto
  27: ['34231','34232','34233','34234','34235','34236','34237','34238','34239','34240','34285','34292','34275','34293'], // Sarasota
};

// Extra ZIPs for coverage
const EXTRA_ZIPS = {
  20: ['33770','33771','33773','33774','33776','33777','33781','33782'],
  21: [],
  22: [],
  23: [],
  24: [],
  25: [],
  26: [],
  27: [],
};

const RX_DL = { 20: 'Jason Sheakoski', 21: 'Maria Santos', 22: 'David Chen', 23: 'Sarah Mitchell', 24: 'Robert Kim', 25: 'Jennifer Walsh', 26: 'Michael Torres', 27: 'Amanda Foster' };
const FS_DL = { 1: 'Scott Partain', 2: 'Lisa Montgomery', 3: "Kevin O'Brien", 4: 'Rachel Nguyen', 5: 'Thomas Anderson', 6: 'Sarah Chen', 7: 'Mark Rodriguez', 8: 'Jennifer Williams', 9: 'David Park', 98: null };

// Tampa Bay street data for realistic addresses and nicknames
const STREETS = [
  { street: 'N Dale Mabry Hwy', cross: 'Fletcher Ave', num: [2401, 4802, 8901, 11540, 14302] },
  { street: 'S Dale Mabry Hwy', cross: 'Gandy Blvd', num: [1502, 3301, 5201] },
  { street: 'W Hillsborough Ave', cross: 'Armenia Ave', num: [3501, 5402, 7810, 9901] },
  { street: 'E Hillsborough Ave', cross: '40th St', num: [1201, 4501, 6302] },
  { street: 'W Kennedy Blvd', cross: 'Westshore Blvd', num: [2102, 4301, 6801] },
  { street: 'E Fletcher Ave', cross: 'Bruce B Downs Blvd', num: [2301, 5101, 12902] },
  { street: 'W Busch Blvd', cross: 'Armenia Ave', num: [2102, 4501, 8103] },
  { street: 'N Nebraska Ave', cross: 'Bearss Ave', num: [1301, 8402, 15201] },
  { street: 'Bayshore Blvd', cross: 'Gandy Blvd', num: [3501] },
  { street: 'W Gandy Blvd', cross: 'Dale Mabry Hwy', num: [4101, 4802] },
  { street: 'US Hwy 19 N', cross: 'SR 54', num: [1234, 3401, 5601, 7803, 9201, 11023, 13540, 15702, 18901, 21340, 24501, 28901] },
  { street: 'Gulf Blvd', cross: 'Corey Ave', num: [401, 3201, 5601, 9801, 14301] },
  { street: 'Central Ave', cross: '34th St', num: [1502, 3401, 5601, 7201] },
  { street: '4th St N', cross: '54th Ave', num: [2301, 5401, 7801, 9201] },
  { street: '34th St S', cross: '22nd Ave', num: [1102, 3301, 5501] },
  { street: 'Park Blvd N', cross: '66th St', num: [5101, 7201, 9301] },
  { street: 'Ulmerton Rd', cross: 'US 19', num: [2201, 4401, 7801, 11201] },
  { street: 'East Bay Dr', cross: 'US 19', num: [1101, 3301, 5502] },
  { street: 'Indian Rocks Rd', cross: 'Ulmerton Rd', num: [2201, 4501] },
  { street: 'Belcher Rd', cross: 'Nursery Rd', num: [1301, 3501, 6801, 9201] },
  { street: 'McMullen Booth Rd', cross: 'SR 580', num: [2101, 3501, 5801] },
  { street: 'Countryside Blvd', cross: 'US 19', num: [2401, 2802] },
  { street: 'Gulf-to-Bay Blvd', cross: 'Belcher Rd', num: [1502, 2801, 4201] },
  { street: 'S Missouri Ave', cross: 'Cleveland St', num: [1, 501, 1201] },
  { street: 'Drew St', cross: 'Highland Ave', num: [301, 1201] },
  { street: 'Court St', cross: 'Missouri Ave', num: [401, 901] },
  { street: 'Cortez Rd W', cross: '75th St', num: [7510, 3201, 5401] },
  { street: 'Manatee Ave W', cross: '14th St', num: [1401, 3501, 5801, 8201] },
  { street: '14th St W', cross: 'Cortez Rd', num: [2102, 4501] },
  { street: 'University Pkwy', cross: 'Honore Ave', num: [3201, 5401, 8101] },
  { street: 'Bee Ridge Rd', cross: 'McIntosh Rd', num: [2101, 4301, 6501] },
  { street: 'Clark Rd', cross: 'Beneva Rd', num: [3401, 5601] },
  { street: 'Fruitville Rd', cross: 'Tuttle Ave', num: [1201, 3401, 5601] },
  { street: 'Tamiami Trail', cross: 'Stickney Point Rd', num: [1501, 3201, 5401, 7801, 10201, 13501] },
  { street: 'Beneva Rd', cross: 'Webber St', num: [2101, 3501] },
  { street: 'Tuttle Ave', cross: 'Bahia Vista St', num: [1501, 3201] },
  { street: 'Brandon Blvd', cross: 'Bloomingdale Ave', num: [1101, 3301, 5501] },
  { street: 'Bloomingdale Ave', cross: 'Lithia Pinecrest Rd', num: [2102, 4501, 6801] },
  { street: 'Causeway Blvd', cross: 'US 301', num: [1201, 3401] },
  { street: 'US 301', cross: 'Progress Blvd', num: [11023, 7801, 14501] },
  { street: 'Big Bend Rd', cross: 'US 301', num: [3201, 6501] },
  { street: 'Bruce B Downs Blvd', cross: 'Bearss Ave', num: [1101, 3401, 5601, 14201, 17501, 19801] },
  { street: 'Gunn Hwy', cross: 'Sheldon Rd', num: [6801, 9201, 13501] },
  { street: 'Sheldon Rd', cross: 'Hillsborough Ave', num: [4501, 7801] },
  { street: 'Ehrlich Rd', cross: 'Dale Mabry Hwy', num: [9201, 12501] },
  { street: 'SR 54', cross: 'US 41', num: [1501, 5801, 11201, 18901] },
  { street: 'SR 56', cross: 'Bruce B Downs Blvd', num: [2101, 6201] },
  { street: 'Gibsonton Dr', cross: 'US 41', num: [7201, 9801] },
  { street: 'Sun City Center Blvd', cross: 'US 301', num: [3201, 1601] },
  { street: 'College Ave', cross: 'US 41', num: [501, 1201] },
  { street: 'Shell Point Rd', cross: 'US 41', num: [2101] },
  { street: 'W Linebaugh Ave', cross: 'N Dale Mabry Hwy', num: [3201, 5501] },
];

let seed = 42;
function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }

// Generate store numbers
const storeNums = new Set();
while (storeNums.size < 143) {
  const n = randInt(100, 19999);
  storeNums.add(n);
}
const storeNumArr = [...storeNums].sort((a, b) => a - b);

// Build stores per district
const districtTargetCounts = { 20: 18, 21: 18, 22: 18, 23: 17, 24: 18, 25: 14, 26: 18, 27: 22 };
const stores = [];
let idx = 0;
const zipUsage = {};
const usedStreets = new Set();

for (let d = 20; d <= 27; d++) {
  const allZips = [...RX_DISTRICT_ZIPS[d], ...(EXTRA_ZIPS[d] || [])];
  const count = districtTargetCounts[d];
  
  for (let s = 0; s < count; s++) {
    const zip = allZips[s % allZips.length];
    const zipData = ZIP_DATA[zip];
    if (!zipData) continue;
    
    if (!zipUsage[zip]) zipUsage[zip] = 0;
    const zipIdx = zipUsage[zip]++;
    const latOff = Math.cos(zipIdx * 2.399963) * 0.002;
    const lngOff = Math.sin(zipIdx * 2.399963) * 0.002;
    
    // Pick a street
    const streetIdx = (idx * 7 + d * 3) % STREETS.length;
    const st = STREETS[streetIdx];
    const numIdx = idx % st.num.length;
    const address = `${st.num[numIdx]} ${st.street}`;
    const nickname = `${st.street.replace(/^[NSEW]\s+/, '').replace(/\s+(Hwy|Blvd|Ave|Rd|Dr|St|Pkwy|Trail)$/i, '')} & ${st.cross.replace(/\s+(Hwy|Blvd|Ave|Rd|Dr|St|Pkwy|Trail)$/i, '')}`;
    const intersection = `${st.street} & ${st.cross}`;
    
    // FS district assignment (geographic)
    let fsDist;
    const isTarget = idx === 12 || idx === 31 || idx === 48 || idx === 67 || idx === 85 || idx === 102 || idx === 118 || idx === 135;
    if (isTarget) {
      fsDist = 98;
    } else {
      fsDist = (d <= 21) ? randInt(1, 3) : (d <= 24) ? randInt(3, 6) : (d <= 25) ? randInt(6, 7) : randInt(7, 9);
    }
    
    stores.push({
      store: storeNumArr[idx],
      fsDistrict: fsDist,
      rxDistrict: d,
      rxDL: RX_DL[d],
      fsDL: isTarget ? null : FS_DL[fsDist],
      address,
      city: zipData.city,
      zip,
      nickname,
      intersection,
      fs24: (idx % 14 === 3) ? 'Yes' : 'No',
      rx24: (idx % 18 === 5) ? 'Yes' : 'No',
      ymas: (idx % 24 === 7) ? 'Yes' : 'No',
      target: isTarget,
      lat: Number((zipData.lat + latOff).toFixed(6)),
      lng: Number((zipData.lng + lngOff).toFixed(6)),
      fsPhone: null,
      rxPhone: null,
      driveThru: null,
      minuteClinic: null,
      volumeTier: null,
      fsHours: null,
      rxHours: null,
      notes: null,
    });
    idx++;
  }
}

writeFileSync('/home/user/store-sprint/src/data/stores.json', JSON.stringify(stores, null, 2));
console.log(`Generated ${stores.length} stores`);

// Stats
const distCounts = {};
for (const s of stores) distCounts[s.rxDistrict] = (distCounts[s.rxDistrict] || 0) + 1;
console.log('Rx districts:', distCounts);
console.log('Targets:', stores.filter(s => s.target).length);
console.log('FS 24hr:', stores.filter(s => s.fs24 === 'Yes').length);
console.log('Rx 24hr:', stores.filter(s => s.rx24 === 'Yes').length);
console.log('Y Más:', stores.filter(s => s.ymas === 'Yes').length);
