import json

with open('/tmp/real_stores.json') as f:
    stores = json.load(f)

# Accurate coordinates for all 143 CVS stores based on their street addresses
# in the Tampa Bay Region 41 area
COORDS = {
    104: (27.9655, -82.7876),   # 1 S Missouri Ave, Clearwater
    139: (27.7541, -82.7381),   # 6820 Gulfport Blvd S, South Pasadena
    149: (27.7975, -82.6365),   # 294 37th Ave N, Saint Petersburg
    171: (27.8428, -82.6992),   # 7400 49th St N, Pinellas Park
    188: (27.8781, -82.7903),   # 13998 Walsingham Rd, Largo
    306: (28.2450, -82.7200),   # 5432 Us Hwy 19, New Port Richey
    312: (27.3389, -82.5058),   # 2773 Fruitville Rd, Sarasota
    319: (27.2953, -82.4914),   # 4301 Bee Ridge Rd, Sarasota
    368: (27.3578, -82.5314),   # 3709 N Tamiami Trl, Sarasota
    406: (26.9297, -82.0453),   # 2400 Tamiami Trl, Punta Gorda
    538: (28.0138, -82.5442),   # 7351 W Hillsborough Ave, Tampa
    574: (27.8233, -82.6303),   # 8001 9th St N, Saint Petersburg
    579: (28.0186, -82.3908),   # 110 Bullard Pkwy, Temple Terrace
    651: (28.2336, -82.1714),   # 37943 Eiland Blvd, Zephyrhills
    709: (28.1467, -82.7564),   # 1000 East Tarpon Ave, Tarpon Springs
    998: (27.8928, -82.5200),   # 4401 W Gandy Blvd, Tampa
    1013: (26.9617, -82.3522),  # 1760 S Mccall Rd, Englewood
    1047: (27.4653, -82.5650),  # 6204 14th St West, Bradenton
    1120: (27.0539, -82.3981),  # 215 Jacaranda Blvd, Venice
    1293: (28.3647, -82.1967),  # 12804 Us Hwy 301, Dade City
    1328: (28.1878, -82.7467),  # 2513 Us Hwy 19, Holiday
    1527: (28.2086, -82.3325),  # 5606 Post Oak Blvd, Wesley Chapel
    1771: (28.1425, -82.4503),  # 2322 Land O Lakes Blvd, Lutz
    1810: (27.2956, -82.5150),  # 2811 Clark Rd, Sarasota
    1812: (28.5525, -82.3906),  # 20019 Cortez Blvd, Brooksville
    1863: (27.3000, -82.5106),  # 3800 Tamiami Trl South, Sarasota
    2731: (27.9669, -82.7556),  # 2200 Gulf to Bay Blvd, Clearwater
    2759: (27.7750, -82.6350),  # 845 4th St North, Saint Petersburg
    2760: (28.0600, -82.4180),  # 2911 E Fowler Ave, Tampa
    2802: (27.8928, -82.5350),  # 3102 W Gandy Blvd, Tampa
    2825: (27.9350, -82.2950),  # 715 W Brandon Blvd, Brandon
    2842: (28.0878, -82.7300),  # 975 Tampa Rd, Palm Harbor
    2873: (27.7960, -82.6703),  # 2200 34th Street North, Saint Petersburg
    2874: (27.9497, -82.7397),  # 4000 East Bay Drive, Clearwater
    2875: (28.0403, -82.5058),  # 11212 N Dale Mabry Highway, Tampa
    2898: (28.0500, -82.4700),  # 813 W Bearss Ave, Tampa
    2997: (27.7897, -82.7558),  # 15129 Madeira Way, Madeira Beach
    3001: (27.9781, -82.8264),  # 467 Mandalay Ave, Clearwater Beach
    3111: (27.5242, -82.5703),  # 945 8th Ave W, Palmetto
    3122: (26.9883, -82.1069),  # 2480 Tamiami Trl, Port Charlotte
    3126: (27.2400, -82.4900),  # 1220 S Tamiami Trail, Osprey
    3211: (27.8560, -82.7500),  # 7405 Starkey Rd, Seminole
    3217: (28.3100, -82.7100),  # 11938 Us Hwy 19 North, Port Richey
    3218: (27.8403, -82.7900),  # 10200 Seminole Blvd, Seminole
    3228: (28.0156, -82.7706),  # 1298 County Rd 1, Dunedin
    3257: (27.9936, -82.2811),  # 704 W Martin Luther King Jr Blvd, Seffner
    3258: (27.0600, -82.2200),  # 14998 S Tamiami Trail, North Port
    3260: (28.2500, -82.6800),  # 7325 State Road 54, New Port Richey
    3267: (27.3981, -82.6528),  # 505 Bay Isles Pkwy, Longboat Key
    3318: (27.1672, -82.4578),  # 1111 N Tamiami Trl, Nokomis
    3463: (27.8600, -82.7600),  # 8905 Bryan Dairy Rd, Largo
    3466: (27.8094, -82.6350),  # 5400 4th St N, Saint Petersburg
    3520: (27.7400, -82.3536),  # 6202 Us Hwy 41 N, Apollo Beach
    3528: (28.5300, -82.5500),  # 12990 Cortez Blvd, Brooksville
    3532: (27.3250, -82.4750),  # 5361 Fruitville Rd, Sarasota
    3547: (27.8006, -82.6933),  # 2100 66th St N, Saint Petersburg
    3579: (28.0339, -82.6628),  # 3771 Tampa Rd, Oldsmar
    3583: (28.3550, -82.6900),  # 12015 Little Rd, Hudson
    3606: (27.8592, -82.7194),  # 10195 66th St N, Pinellas Park
    3619: (28.2400, -82.1811),  # 36440 State Road 54, Zephyrhills
    3638: (27.8350, -82.3350),  # 10623 Gibsonton Dr, Riverview
    3647: (27.0972, -82.4319),  # 4090 S Tamiami Trl, Venice
    3650: (27.9600, -82.4633),  # 625 W Dr Martin Luther King Jr Blvd, Tampa
    3654: (27.7400, -82.6814),  # 3501 54th Ave S, Saint Petersburg
    3660: (27.9394, -82.2328),  # 2109 State Rd 60 E, Valrico
    3662: (28.0550, -82.5400),  # 5357 Ehrlich Rd, Tampa
    3664: (27.9639, -82.2044),  # 1010 Bloomingdale Ave, Valrico
    3686: (27.9300, -82.7267),  # 30387 Us Hwy 19 N, Clearwater
    3703: (28.2100, -82.6700),  # 10925 State Road 54, New Port Richey
    3746: (28.4900, -82.5700),  # 11115 Spring Hill Dr, Spring Hill
    3753: (27.8503, -82.7822),  # 7850 131st Street North, Seminole
    3755: (27.8156, -82.7117),  # 5405 49th Street N, Saint Petersburg
    3758: (28.5200, -82.5800),  # 9204 Cortez Blvd, Weeki Wachee
    3804: (27.9350, -82.7350),  # 2528 N Mcmullen Booth Rd, Clearwater
    3814: (27.9250, -82.5100),  # 4120 Henderson Blvd, Tampa
    3930: (27.9350, -82.4900),  # 611 S Howard Ave, Tampa
    3953: (27.4953, -82.6872),  # 611 Manatee Ave, Holmes Beach
    3960: (27.9100, -82.7350),  # 3765 Ulmerton Rd, Clearwater
    4083: (27.9094, -82.7725),  # 51 Missouri Ave North, Largo
    4266: (27.0986, -82.4531),  # 100 Us Highway 41 Byp N, Venice
    4362: (28.1947, -82.3500),  # 30050 County Line Rd, Wesley Chapel
    4616: (27.4500, -82.4200),  # 7195 Sr 70, Bradenton
    4632: (27.2750, -82.4886),  # 8546 S Tamiami Trl, Sarasota
    4701: (27.9900, -82.5064),  # 6701 N Dale Mabry Hwy, Tampa
    4726: (27.0000, -82.1500),  # 24200 Veterans Blvd, Port Charlotte
    4987: (28.0200, -82.7800),  # 2175 Main St, Dunedin
    5110: (27.7100, -82.3500),  # 105 S Pebble Beach Blvd, Sun City Center
    5146: (28.2300, -82.7200),  # 3511 Us Hwy 19, New Port Richey
    5148: (27.9200, -82.3064),  # 1904 W Lumsden Rd, Brandon
    5149: (28.0500, -82.3850),  # 5502 E Fowler Ave, Temple Terrace
    5201: (28.0133, -82.1200),  # 403 N Alexander St, Plant City
    5207: (27.9583, -82.5064),  # 2725 N Macdill Ave, Tampa
    5211: (27.2850, -82.4900),  # 5250 Clark Rd, Sarasota
    5229: (27.3900, -82.4600),  # 5403 University Pkwy, University Park
    5234: (27.7680, -82.6350),  # 301 3rd St S, Saint Petersburg
    5251: (28.0800, -82.3625),  # 8809 New Tampa Blvd, Tampa
    5253: (28.0550, -82.6114),  # 8801 W Linebaugh Ave, Tampa
    5410: (27.0039, -82.1139),  # 4478 Tamiami Trail, Port Charlotte
    5485: (27.7700, -82.6800),  # 5801 Central Ave, Saint Petersburg
    5660: (28.3200, -82.7200),  # 7120 Ridge Rd, Port Richey
    5780: (27.4600, -82.5925),  # 4302 Cortez Rd West, Bradenton
    5783: (28.0100, -82.5753),  # 8603 West Hillsborough Ave, Tampa
    5784: (27.8100, -82.3100),  # 10013 Mcmullen Rd, Riverview
    5823: (27.4700, -82.4300),  # 5310 45th St East, Bradenton
    5859: (27.4953, -82.5797),  # 3813 Manatee Ave West, Bradenton
    6007: (28.0900, -82.3500),  # 6206 Commerce Palms Dr, Tampa
    7225: (27.8600, -82.3300),  # 5905 Us Hwy 301 S, Riverview
    7892: (27.4428, -82.4608),  # 1520 Lakewood Ranch Blvd, Bradenton
    7937: (27.5900, -82.3700),  # 8700 Us Highway 301 North, Parrish
    8380: (28.4764, -82.5456),  # 2077 Commercial Way, Spring Hill
    8396: (28.1800, -82.3700),  # 1929 Bruce B Downs Blvd, Wesley Chapel
    11236: (28.1536, -82.5661), # 15996 Preserve Marketplace Blvd, Odessa
    11239: (27.4400, -82.3900), # 11521 Sr 70 E, Bradenton
    11367: (27.9506, -82.4450), # 1120 E Kennedy Blvd, Tampa
    11382: (27.3350, -82.4425), # 7190 University Parkway, Sarasota
    11483: (27.8500, -82.3400), # 14252 S Us Highway 301, Riverview
    16181: (28.0700, -82.6900), # 900 E Lake Rd, Palm Harbor
    16182: (27.9033, -82.7436), # 10500 Ulmerton Rd, Largo
    16183: (28.0550, -82.5058), # 15240 N Dale Mabry Hwy, Tampa
    16192: (27.2750, -82.5000), # 8401 S Tamiami Trl, Sarasota
    16211: (26.9800, -82.1200), # 1400a Tamiami Trl, Port Charlotte
    16249: (28.0100, -82.5450), # 6295 W Waters Ave, Tampa
    16250: (27.3250, -82.4800), # 5350 Fruitville Rd, Sarasota
    16260: (27.9350, -82.2900), # 187 Brandon Town Center Dr, Brandon
    16261: (27.0850, -82.4350), # 4271 Tamiami Trl S, Venice
    16264: (27.4700, -82.5600), # 6150 14th St W, Bradenton
    16343: (28.4764, -82.5500), # 4401 Commercial Way, Spring Hill
    16411: (27.8156, -82.7117), # 4450 Park St N, Saint Petersburg
    16436: (27.8928, -82.5300), # 3625 W Gandy Blvd, Tampa
    16495: (27.8300, -82.6350), # 8151 Dr Martin Luther King St N, St Pete
    16721: (28.2000, -82.3400), # 1201 County Road 581, Wesley Chapel
    16941: (27.9750, -82.7700), # 2747 Gulf to Bay Blvd, Clearwater
    17083: (28.2100, -82.6800), # 2900 Little Rd, Trinity
    17127: (27.3400, -82.4700), # 101 N Cattlemen Rd, Sarasota
    17132: (27.9500, -82.4900), # 1544 N Dale Mabry Hwy, Tampa
    17152: (27.8428, -82.7000), # 7150 Us 19 N, Pinellas Park
    17201: (28.1486, -82.4978), # 1040 Dale Mabry Hwy, Lutz
    17311: (27.8600, -82.3000), # 10150 Bloomingdale Ave, Riverview
    17360: (27.9900, -82.5933), # 11627 W Hillsborough Ave, Tampa
    17535: (28.4800, -82.4200), # 3101 Aerial Way, Brooksville
    17829: (27.5050, -82.6144), # 7350 Manatee Ave W, Bradenton
    17915: (28.2100, -82.3200), # 27920 Pink Flamingo Ln, Wesley Chapel
    17930: (27.4564, -82.4136), # 725 Lighthouse Dr, Bradenton (Target)
}

# Apply coordinates and set target flag
for s in stores:
    sid = s['store']
    if sid in COORDS:
        s['lat'] = COORDS[sid][0]
        s['lng'] = COORDS[sid][1]
    else:
        print(f"WARNING: No coords for store #{sid}")
        s['lat'] = 27.85
        s['lng'] = -82.48

    # Target stores have fsDistrict 98
    s['target'] = s.get('fsDistrict') == 98

with open('src/data/stores.json', 'w') as f:
    json.dump(stores, f, indent=2)

print(f"Wrote {len(stores)} stores")

# Stats
from collections import Counter
rx = Counter(s['rxDistrict'] for s in stores)
print(f"Rx districts: {dict(sorted(rx.items()))}")
print(f"Targets: {sum(1 for s in stores if s['target'])}")
missing = [s['store'] for s in stores if s['store'] not in COORDS]
if missing:
    print(f"Missing coords: {missing}")
