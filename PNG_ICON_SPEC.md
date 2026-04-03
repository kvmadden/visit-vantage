# PNG Icon Specification — Visit Vantage Map Icons

> **Purpose**: Feed this entire document into an AI image generator (ChatGPT/DALL-E, Midjourney, Canva AI, etc.) to produce all 236 PNG icon files for the Visit Vantage Tampa Bay map application.

---

## GLOBAL RULES (Apply to EVERY icon)

### File Format & Size
- **Format**: PNG with **transparent background** (alpha channel)
- **Canvas size**: 128 × 128 pixels
- **Content area**: Icon centered, with ~8px padding on all sides (actual icon fills ~112×112px)
- **Style**: Clean vector-style illustration, flat or semi-flat design, crisp edges — NOT photorealistic
- **Line weight**: Medium (2-3px equivalent at 128px scale) for consistency across all icons

### Two Icon Types
1. **Easter Egg icons** (53 icons) — each has **4 variants**: inactive-light, inactive-dark, active-light, active-dark
2. **Best of the Bay icons** (12 icons) — each has **2 variants**: light, dark (always shown in "active" gold style)

### File Naming Convention
```
Easter Eggs:    {svgKey}_inactive_light.png
                {svgKey}_inactive_dark.png
                {svgKey}_active_light.png
                {svgKey}_active_dark.png

Best of Bay:    {svgKey}_light.png
                {svgKey}_dark.png
```
Example: `pirateShip_inactive_light.png`, `bernsSteak_dark.png`

---

## STATE RULES

### INACTIVE State (Easter Eggs only)
- **Purpose**: A subtle hint on the map — the user hasn't found this egg yet
- **Opacity feel**: ~40% apparent opacity (muted, ghostly)
- **Color**: Use ONLY the icon's **category color** (see palette below) — monochromatic
- **Detail level**: SIMPLIFIED — show only the most recognizable silhouette/outline
- **Style**: Thin strokes, minimal fills, no shading or gradients
- **Think of it as**: A faded rubber stamp or watermark version of the icon
- **NO**: Do not show the full detailed scene — strip it down to essential shape only

### ACTIVE State (Easter Eggs)
- **Purpose**: The user found the egg! Reward them with a detailed, vibrant icon
- **Opacity feel**: 100% — full vivid color
- **Color**: Full color palette — category color as primary, plus realistic accent colors
- **Detail level**: FULL — add textures, shading, secondary elements, environmental context
- **Style**: Rich illustration with depth — shadows, highlights, fine details
- **Think of it as**: The icon "coming alive" — a dramatic upgrade from the inactive version

### Best of the Bay Icons
- **Always "active"** — these are premium curated destinations, always shown prominently
- **Color**: GOLD (#FBBF24) as the dominant/primary color, rendered as a **silhouette** style
- **Style**: Elegant gold silhouette on transparent background — like a gold foil stamp or award badge
- **Detail level**: Medium — recognizable and distinctive, but stylized rather than hyper-detailed

---

## LIGHT vs DARK MODE ADAPTATIONS

### Light Mode (`_light` suffix)
- **Stroke/outline color**: Warm dark gray `#57534e` (stone-600)
- **Fill tones**: Medium gray `#78716c` (stone-500) for neutral fills
- **Category colors**: Use the standard palette values below
- **Shadows**: Subtle, using darker shades
- **Best of Bay gold**: `#FBBF24` standard gold
- **General feel**: Warm, earthy, slightly muted

### Dark Mode (`_dark` suffix)
- **Stroke/outline color**: Light gray `#d4d4d8` (zinc-300)
- **Fill tones**: Light gray `#a1a1aa` (zinc-400) for neutral fills
- **Category colors**: Use slightly BRIGHTER/LIGHTER versions for visibility on dark backgrounds
- **Shadows**: Use lighter highlights instead of dark shadows
- **Best of Bay gold**: `#D4A04A` (warmer, brighter gold for dark backgrounds)
- **General feel**: Cool-toned, luminous, slightly ethereal

---

## CATEGORY COLOR PALETTE

| Category   | Color Code | Color Name     | Used By                        |
|------------|------------|----------------|--------------------------------|
| Marine     | `#2DD4BF`  | Teal/Cyan      | Dolphins, gators, turtles, rays |
| Birds      | `#38BDF8`  | Sky Blue        | Pelicans, osprey, cranes, flamingos |
| Nature     | `#4ADE80`  | Green           | Lightning, orchids, mangroves  |
| Culture    | `#FB923C`  | Orange          | Food, cigars, beer, strawberries |
| Heritage   | `#A78BFA`  | Purple          | Pirates, history, Seminoles    |
| Sports     | `#F87171`  | Red/Pink        | Hockey, football, baseball     |
| Folklore   | `#C084FC`  | Light Purple    | Kraken, UFO, Skunk Ape         |
| Landmarks  | `#FBBF24`  | Gold/Yellow     | Bridges, islands, tiki huts    |

**Dark mode adjustments**: Increase brightness ~15-20% for all category colors to maintain visibility on dark backgrounds.

---

## OVERLAP AUDIT

The following items were audited to ensure NO icon concept is duplicated between Easter Eggs and Best of Bay:

| Easter Egg | Best of Bay | Conflict? | Resolution |
|------------|-------------|-----------|------------|
| `pirateShip` (Gasparilla sailing ship) | `pirateShipBow` (stadium cannon/ship bow) | **No** — different subjects: one is a sailing vessel at sea, the other is the stadium's pirate ship bow with cannons firing |
| `lightning` (weather bolt from sky) | `lightningBolt` (Amalie Arena sports bolt) | **No** — weather phenomenon vs. sports team logo/arena context |
| `cigar` (hand-rolled cigar) | `cigarIcon` (Ybor rooster/wild chicken) | **No** — completely different subjects despite category overlap |
| `flamingo` (lawn flamingo bird) | `flamencoDancer` (Columbia Restaurant dancer) | **No** — bird vs. human dancer |

**Result**: All 65 icons (53 EE + 12 BoB) depict **unique, distinct subjects**. No duplicates.

---

## EASTER EGG ICONS — Per-Icon Specifications

### Format for each entry:
- **svgKey**: The filename prefix
- **Title**: Display name in the app
- **Category**: Color category (determines inactive state color)
- **Description**: What the icon depicts and the real-world reference
- **INACTIVE**: What to show in the simplified/muted version
- **ACTIVE**: What to show in the full/vibrant version

---

### BATCH 1: Warm-up (5 icons × 4 variants = 20 PNGs)

#### 1. `pirateShip` — Gasparilla!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Jose Gaspar's pirate ship — the legendary pirate of Tampa Bay, celebrated at the annual Gasparilla festival
- **INACTIVE**: A single mast with a triangular sail poking above a wavy horizon line. Tiny flag at top. All in purple monochrome, ghostly.
- **ACTIVE**: Full pirate ship with brown wooden hull, cream-colored billowing sails, cannon ports along the hull, Jolly Roger flag (black with white skull), crow's nest, rigging ropes, bowsprit, and teal ocean waves beneath. Red trim stripe on hull.

#### 2. `kraken` — Release the Kraken!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: A giant kraken/sea monster rising from Tampa Bay — Gulf of Mexico deep water folklore
- **INACTIVE**: Three tentacle tips curling up above a wavy waterline, evenly spaced. Small sucker dots on tentacles. All in light purple monochrome.
- **ACTIVE**: Full kraken with massive domed purple head, glowing yellow eyes with dark pupils, open mouth, and 4 long tentacles reaching upward out of the water with coral-pink sucker dots. Water splashes at base.

#### 3. `skunkApe` — Skunk Ape Sighting!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Florida's Skunk Ape — the swamp-dwelling Bigfoot cousin of the Everglades and Green Swamp
- **INACTIVE**: A dark shadowy bigfoot silhouette standing among simple vertical lines (trees/reeds). Glowing yellow eyes peering out. All in light purple monochrome.
- **ACTIVE**: Full hairy ape-like creature with shaggy dark brown fur, muscular build, standing in a swamp scene with green hanging Spanish moss, teal swamp water at feet, and dark green cypress trees in background. Yellow glowing eyes.

#### 4. `strawberry` — Berry Nice!
- **Category**: Culture (`#FB923C` orange)
- **Description**: Plant City strawberry — the Winter Strawberry Capital of the World
- **INACTIVE**: Simple strawberry outline/silhouette with a few seed dots. Small leaf crown on top. All in orange monochrome.
- **ACTIVE**: Lush red strawberry with visible seeds, bright green leaf crown, a small slice showing pink interior, maybe a tiny blossom. Realistic fruit colors — red body, green leaves, yellow seeds.

#### 5. `lightning` — Lightning Capital!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Lightning bolt over Lightning Alley — Tampa Bay is the lightning capital of North America
- **INACTIVE**: A single zigzag lightning bolt shape, thin and angular. All in green monochrome.
- **ACTIVE**: Dramatic forked lightning bolt in bright yellow/white striking down from a dark storm cloud. Electric glow effect around the bolt. Dark blue-gray cloud at top, rain lines, and a faint green glow at the ground impact point.

---

### BATCH 2: Sea & Sky (5 icons × 4 variants = 20 PNGs)

#### 6. `mermaid` — Weeki Wachee Mermaids!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Weeki Wachee Springs mermaid — the iconic live mermaid shows running since 1947
- **INACTIVE**: Simple mermaid tail silhouette curving upward, with flowing hair lines at top. All in light purple monochrome.
- **ACTIVE**: Beautiful mermaid with flowing hair, detailed scaled tail in teal/purple iridescent colors, seashell top, holding a small air hose (the real Weeki Wachee mermaids breathe from hoses). Underwater bubbles, small fish nearby. Spring-clear blue water tones.

#### 7. `cigar` — Cigar City!
- **Category**: Culture (`#FB923C` orange)
- **Description**: Hand-rolled Ybor City cigar — Tampa was the Cigar Capital of the World
- **INACTIVE**: Simple horizontal cigar shape with a band ring in the middle. Thin wisp of smoke curling up from the lit end. All in orange monochrome.
- **ACTIVE**: Detailed hand-rolled cigar with realistic brown tobacco wrapper texture, ornate gold-and-red cigar band, glowing orange ember at the lit tip, and elegant curling smoke wisps rising up. Rich warm brown tones.

#### 8. `dolphin` — Bottlenose!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Bottlenose dolphin leaping — commonly spotted in Tampa Bay and along the Gulf Coast
- **INACTIVE**: Simple dolphin silhouette mid-leap, arcing over a wavy line (water surface). All in teal monochrome.
- **ACTIVE**: Sleek gray bottlenose dolphin leaping out of teal-blue water with a splash beneath. Detailed flippers, dorsal fin, smiling rostrum, eye detail. Water droplets in the air. Sunny feel.

#### 9. `pelican` — Brown Pelican!
- **Category**: Birds (`#38BDF8` sky blue)
- **Description**: Brown pelican diving — an iconic coastal bird seen on every pier and dock
- **INACTIVE**: Simple pelican silhouette perched on a post/piling, large bill visible. All in sky blue monochrome.
- **ACTIVE**: Brown pelican with detailed plumage — brown body, white/cream neck, large gray bill with yellow-orange pouch. Perched on a wooden dock piling. Maybe wings slightly spread. Realistic bird coloring.

#### 10. `osprey` — Osprey!
- **Category**: Birds (`#38BDF8` sky blue)
- **Description**: Osprey in flight — fish hawks that nest on power poles and channel markers around Tampa Bay
- **INACTIVE**: Bird of prey silhouette with spread wings, soaring. Simple angular wing shape. All in sky blue monochrome.
- **ACTIVE**: Osprey with wings spread wide in flight, talons extended gripping a fish. White breast, brown wings with distinctive dark eye stripe. Detailed feather patterns. Fish (silver/gray) in talons.

---

### BATCH 3: Wildlife (5 icons × 4 variants = 20 PNGs)

#### 11. `sandhillCrane` — Sandhill Crane!
- **Category**: Birds (`#38BDF8` sky blue)
- **Description**: Sandhill crane pair — tall gray birds that wander suburban lawns across Central Florida
- **INACTIVE**: Tall wading bird silhouette standing on long legs, long neck, small head. All in sky blue monochrome.
- **ACTIVE**: Elegant sandhill crane standing tall with gray plumage, distinctive red crown patch on forehead, long dark legs, long neck. Standing in grass. Realistic gray-brown bird coloring with that signature red patch.

#### 12. `gopherTortoise` — Gopher Tortoise!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Gopher tortoise — a keystone species whose burrows shelter 350+ other animals in Florida scrub
- **INACTIVE**: Simple tortoise/turtle silhouette from the side, domed shell visible. All in gold monochrome.
- **ACTIVE**: Detailed gopher tortoise with brown-gray domed shell with visible scute pattern, sturdy elephant-like legs, small head peeking out. Sandy ground beneath, maybe entrance to its burrow visible. Earthy brown/tan colors.

#### 13. `alligator` — Gator!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: American alligator — 1.3 million gators call Florida home
- **INACTIVE**: Low-profile gator silhouette — just eyes and snout ridge above a waterline, with a subtle tail curve. All in teal monochrome.
- **ACTIVE**: Full American alligator with dark olive-green scaly skin, powerful jaws (slightly open showing teeth), thick tail, partially submerged in water. Yellow-green eyes. Detailed scales and armor plates. Swampy green water around it.

#### 14. `roseateSpoonbill` — Roseate Spoonbill!
- **Category**: Birds (`#38BDF8` sky blue)
- **Description**: Roseate spoonbill wading — the stunning pink bird often mistaken for a flamingo
- **INACTIVE**: Wading bird silhouette with distinctive spoon-shaped bill (wider/flatter than other birds). All in sky blue monochrome.
- **ACTIVE**: Gorgeous roseate spoonbill with vibrant pink plumage, distinctive flat spoon-shaped bill sweeping through shallow water, long pink legs. Shades of pink from pale to hot pink on wings. Standing in shallow mangrove water.

#### 15. `seaTurtle` — Sea Turtle Nesting!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Loggerhead sea turtle — nests on Gulf beaches every summer
- **INACTIVE**: Sea turtle silhouette swimming, flippers extended, oval shell. All in teal monochrome.
- **ACTIVE**: Beautiful loggerhead sea turtle swimming with outstretched flippers. Brown-olive shell with detailed scute pattern, lighter tan/cream underside. Flippers with scale detail. Maybe a few small bubbles. Ocean blue-teal water feel.

---

### BATCH 4: Landmarks (5 icons × 4 variants = 20 PNGs)

#### 16. `skywayBridge` — Sunshine Skyway!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Sunshine Skyway Bridge — the iconic cable-stayed bridge spanning Tampa Bay, rebuilt after the 1980 disaster
- **INACTIVE**: Simple bridge silhouette with two tower pylons and cable stays fanning down. Horizontal roadway line. All in gold monochrome.
- **ACTIVE**: Dramatic Sunshine Skyway Bridge with bright yellow cable stays fanning from twin concrete pylons, blue water below, sunset-colored sky behind. The distinctive inverted-Y tower shape is key. Cars on the roadway as tiny dots.

#### 17. `spongeDiver` — Sponge Diver!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Tarpon Springs sponge diver — Greek immigrants brought deep-sea sponge diving to Florida in the early 1900s
- **INACTIVE**: Standing figure silhouette in old-fashioned diving suit with round helmet. All in purple monochrome.
- **ACTIVE**: Classic vintage deep-sea diver in brass/copper diving helmet with round viewing ports, canvas suit, weighted boots, air hose trailing upward. Holding a natural sponge in one hand. Bubbles rising. Underwater blue-green tones with the warm brass helmet as focal point.

#### 18. `hockeyPuck` — Back-to-Back!
- **Category**: Sports (`#F87171` red)
- **Description**: Hockey puck for the Tampa Bay Lightning — back-to-back Stanley Cup champions 2020-2021
- **INACTIVE**: Simple circle/disc shape (puck from above) with a few horizontal lines across it. All in red monochrome.
- **ACTIVE**: Black hockey puck with a small lightning bolt emblem, sitting on ice with ice spray/shavings around it. A hockey stick blade visible hitting the puck. Ice surface with scratch marks. Black puck, blue-white ice, red accent from stick tape.

#### 19. `pirateFlag` — Fire the Cannons!
- **Category**: Sports (`#F87171` red)
- **Description**: Jolly Roger pirate flag — representing the Tampa Bay Buccaneers, Super Bowl LV champions
- **INACTIVE**: Simple flag on a pole, with a basic skull shape visible on the flag. Flag waving slightly. All in red monochrome.
- **ACTIVE**: Black Jolly Roger flag flying on a wooden pole, with white skull and crossed swords/bones on the flag, flag billowing in the wind. Red trim on the flag edges. Dramatic and bold — the Bucs' pirate spirit.

#### 20. `stingray` — Rays Up!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Cownose stingray gliding — massive schools migrate through Tampa Bay every spring
- **INACTIVE**: Simple diamond/wing shape of a ray gliding, seen from above. Thin tail trailing behind. All in teal monochrome.
- **ACTIVE**: Graceful cownose stingray with wide wing-like pectoral fins spread out, gliding through clear blue water. Light tan/brown top with lighter underside showing. Long thin tail. Smooth, elegant shape. Subtle water caustic light patterns.

---

### BATCH 5: Food & Culture (5 icons × 4 variants = 20 PNGs)

#### 21. `greekCross` — Epiphany Cross Dive!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Greek Orthodox cross — honoring Tarpon Springs' Greek heritage and the annual Epiphany cross dive
- **INACTIVE**: Simple cross shape with slightly flared/ornate ends (Greek Orthodox style, not plain). All in purple monochrome.
- **ACTIVE**: Ornate Greek Orthodox cross in gold with intricate decorative ends, partially submerged in blue-green water with splash effects — representing the famous dive. Water droplets on the cross. Gold cross, blue water, white splash.

#### 22. `cubanSandwich` — Tampa Cuban!
- **Category**: Culture (`#FB923C` orange)
- **Description**: Tampa's signature Cuban sandwich — ham, roast pork, Swiss, pickles, mustard on Cuban bread
- **INACTIVE**: Simple sandwich silhouette — long sub shape with a line through the middle (pressed). All in orange monochrome.
- **ACTIVE**: Delicious pressed Cuban sandwich cut in half showing layers: golden-brown pressed Cuban bread, pink ham, roast pork, melted yellow Swiss cheese, green pickle slices, yellow mustard. Grill press marks on bread. Toothpick through the top. Warm appetizing colors.

#### 23. `grouper` — Grouper Sandwich!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Grouper fish — the Gulf grouper sandwich is a Tampa Bay culinary staple
- **INACTIVE**: Simple fish silhouette — stocky, wide-mouthed grouper shape. All in teal monochrome.
- **ACTIVE**: Hefty grouper fish with brown-olive mottled skin, large mouth, prominent dorsal fin, thick body. Detailed scales and fins. Swimming near a coral/reef structure. Brown, olive, and tan realistic fish coloring.

#### 24. `orange` — Florida Orange!
- **Category**: Culture (`#FB923C` orange)
- **Description**: Florida orange — the Sunshine State produces 70% of U.S. citrus
- **INACTIVE**: Simple circle with a small stem and leaf at top (orange shape). All in orange monochrome.
- **ACTIVE**: Bright, juicy Florida orange with realistic dimpled skin texture, green stem with two leaves, maybe a slice showing juicy orange interior segments. Bright orange with green leaf accent. Fresh and vibrant.

#### 25. `craftBeer` — Cheers!
- **Category**: Culture (`#FB923C` orange)
- **Description**: Craft beer pint — Tampa Bay has 80+ craft breweries
- **INACTIVE**: Simple pint glass silhouette with foam line at top. All in orange monochrome.
- **ACTIVE**: Frosty pint glass filled with amber/golden craft beer, thick white foam head overflowing slightly. Condensation droplets on the glass. Maybe a small hop cone accent. Warm amber gold beer color, white foam, clear glass.

---

### BATCH 6: Tropical (5 icons × 4 variants = 20 PNGs)

#### 26. `flamingo` — Lawn Flamingo!
- **Category**: Birds (`#38BDF8` sky blue)
- **Description**: Pink flamingo — wild flamingos returning to Florida, plus the iconic lawn ornament
- **INACTIVE**: Flamingo silhouette standing on one leg, curved neck, round body. All in sky blue monochrome.
- **ACTIVE**: Bright hot-pink flamingo standing on one long pink leg, elegant S-curved neck, black-tipped bill. Lush and vibrant pink plumage. Classic flamingo pose. Maybe standing in shallow water with a subtle reflection.

#### 27. `tikiHut` — Tiki Time!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Tiki hut — the quintessential Florida beach bar with thatched chickee hut
- **INACTIVE**: Simple A-frame/triangular roof shape on two posts (tiki hut outline). All in gold monochrome.
- **ACTIVE**: Charming tiki hut with detailed thatched palm-frond roof, wooden support poles wrapped with rope, a small bar counter underneath, maybe a tiki torch on one side. Warm brown wood, golden-tan thatch, tropical feel. A small palm tree beside it.

#### 28. `ufo` — UFO Sighting!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: UFO over Gulf Breeze — Florida's famous 1987 UFO sighting wave
- **INACTIVE**: Simple flying saucer disc shape with a small dome on top. All in light purple monochrome.
- **ACTIVE**: Classic silver/metallic flying saucer with domed top, colored lights around the rim (green, red, blue), a beam of light shining down from the bottom. Night sky behind with stars. Metallic silver saucer, colorful lights, dramatic beam.

#### 29. `conchShell` — Conch Shell!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Queen conch shell — symbol of Florida's coastal heritage
- **INACTIVE**: Simple spiral shell silhouette (conch shape). All in gold monochrome.
- **ACTIVE**: Beautiful queen conch shell with pearlescent pink interior, spiral ridged exterior in warm cream/tan/brown, flared lip showing the gorgeous pink inside. Sitting on sand. Natural shell colors — cream exterior, pink interior, sandy base.

#### 30. `treasureChest` — Pirate Treasure!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Pirate treasure chest — legends of buried treasure along the Gulf Coast tied to Gasparilla
- **INACTIVE**: Simple chest/box shape with a rounded lid, slightly open. A small keyhole or lock on front. All in purple monochrome.
- **ACTIVE**: Open wooden treasure chest overflowing with gold coins, jewels, and pearl necklaces spilling out. Ornate metal bands/hinges on the dark wood chest. Gold coins scattered on the sand around it. Rich browns, glittering gold, ruby red and emerald green gems.

---

### BATCH 7: Spooky & Sport (5 icons × 4 variants = 20 PNGs)

#### 31. `gibsonton` — Gibtown Showtown!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Gibsonton carnival tent — "Gibtown" was the off-season home for sideshow performers, with special zoning for exotic animals
- **INACTIVE**: Simple circus/carnival tent peak silhouette with a flag on top and scalloped edge. All in light purple monochrome.
- **ACTIVE**: Colorful striped carnival tent (red and white stripes) with pennant flags, a "SIDESHOW" banner, carnival lights along the edges. A ferris wheel silhouette in the background. Warm evening lighting. Red, white, gold, purple accents.

#### 32. `spookHill` — Spook Hill!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Spook Hill gravity illusion — the famous optical illusion hill in Lake Wales where cars appear to roll uphill
- **INACTIVE**: Simple hill/slope line with a small car silhouette on it, tilted at an angle. All in light purple monochrome.
- **ACTIVE**: A car (vintage style) appearing to roll uphill on a sloped road with a "SPOOK HILL" sign visible. Spooky atmosphere — misty/foggy, maybe a ghostly Native American chief or alligator spirit faintly visible in the mist. Eerie green-purple tones.

#### 33. `joyland` — Joyland!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Abandoned Joyland ferris wheel — haunting remnants of Florida's forgotten roadside amusement parks
- **INACTIVE**: Simple ferris wheel silhouette — circle with spokes and small car shapes around the rim. All in light purple monochrome.
- **ACTIVE**: Rusting, overgrown abandoned ferris wheel with vines and vegetation growing through it. Faded paint, broken seats, rust-orange metal against green overgrowth. Haunting but beautiful — urban decay meets nature reclaiming. Rust, green, faded carnival colors.

#### 34. `babeRuth` — The Bambino!
- **Category**: Sports (`#F87171` red)
- **Description**: Babe Ruth baseball — the Sultan of Swat did spring training in Tampa
- **INACTIVE**: Simple baseball silhouette — circle with curved stitching lines. All in red monochrome.
- **ACTIVE**: Classic white baseball with red stitching, a wooden bat crossed behind it, and a vintage 1920s-era baseball cap. Home plate or a diamond shape in the background. Nostalgic sepia-tinted feel with red stitching popping. Vintage Americana style.

#### 35. `phosphateMining` — Bone Valley!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Phosphate mining cart — Bone Valley near Tampa produces 75% of U.S. phosphate, with fossil-rich deposits
- **INACTIVE**: Simple mining cart silhouette on rails — box car shape on two wheels. All in purple monochrome.
- **ACTIVE**: Old-fashioned mining cart on tracks filled with phosphate rock, with a large fossilized shark tooth (megalodon) visible among the rocks. Mining headframe/derrick in background. Earthy brown cart, gray-white phosphate rock, the distinctive dark fossil tooth as focal point.

---

### BATCH 8: Deep Water (5 icons × 4 variants = 20 PNGs)

#### 36. `sharkTooth` — Shark Tooth Capital!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Megalodon shark tooth — Venice, FL is the "Shark Tooth Capital of the World" with prehistoric fossils washing ashore
- **INACTIVE**: Simple triangular tooth shape with serrated edges. All in teal monochrome.
- **ACTIVE**: Large, dark fossilized megalodon tooth (triangular, serrated edges) sitting on sandy beach with small shells around it. The tooth is dark gray/black with a glossy fossilized look. Sandy beach colors, dark dramatic tooth. Maybe a hand for scale showing how massive it is.

#### 37. `tarponFish` — Silver King!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Silver king tarpon — the prized game fish that draws anglers to Tampa Bay bridges and passes
- **INACTIVE**: Leaping fish silhouette — elongated body, forked tail, mouth open. All in teal monochrome.
- **ACTIVE**: Magnificent silver tarpon leaping out of the water, mouth wide open, scales gleaming with metallic silver sheen. Large prominent eye, forked tail, powerful body. Water splashing around it. Brilliant silver with blue-teal water. The "Silver King" in all its glory.

#### 38. `shipwreck` — Shipwreck!
- **Category**: Folklore (`#C084FC` light purple)
- **Description**: Sunken shipwreck — hundreds of wrecks lie off the Gulf Coast, from Spanish galleons to WWII vessels
- **INACTIVE**: Simple sunken ship outline tilted on its side, with a wavy waterline above. All in light purple monochrome.
- **ACTIVE**: Underwater scene of a sunken wooden ship (Spanish galleon style) tilted and broken on the ocean floor. Coral and sea life growing on the hull. Fish swimming through the broken ribs of the ship. Moody blue-green underwater lighting. Dark wood, colorful coral, schools of small fish.

#### 39. `mantaRay` — Manta Ray!
- **Category**: Marine (`#2DD4BF` teal)
- **Description**: Giant manta ray — graceful winged rays in Gulf waters, wingspans up to 23 feet
- **INACTIVE**: Simple diamond/wing shape from above — wider and more angular than the stingray, with cephalic fins (horn-like flaps) at the front. All in teal monochrome.
- **ACTIVE**: Majestic manta ray gliding through blue water with enormous wing-like pectoral fins spread wide. Dark back (black/navy) with white belly markings. Distinctive cephalic fins (like horns) flanking the wide mouth. Remora fish riding along. Deep blue water with light rays filtering down.

#### 40. `spanishMoss` — Spanish Moss!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Spanish moss draping from live oaks — the atmospheric gray garlands throughout the Bay area
- **INACTIVE**: Vertical hanging strands/garlands draping down from a horizontal branch line at top. Wispy, flowing lines. All in purple monochrome.
- **ACTIVE**: Thick curtains of silver-gray Spanish moss hanging from a gnarled live oak branch. The branch is dark brown and twisted. Moss is delicate, wispy, atmospheric — almost ghostly. Soft gray-green moss, dark brown branch, dappled sunlight filtering through. Southern Gothic beauty.

---

### BATCH 9: Folklore (5 icons × 4 variants = 20 PNGs)

#### 41. `greenFlash` — Green Flash!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Green flash sunset — the rare optical phenomenon visible over the Gulf of Mexico at sunset
- **INACTIVE**: Simple half-circle (setting sun) on a horizon line with a small green dot/flash at the top of the sun. All in green monochrome.
- **ACTIVE**: Stunning sunset over the Gulf with the sun half below the horizon, and a vivid bright green flash emanating from the top of the sun. Orange/pink/purple sky gradient, dark blue water, and that brilliant green flash as the focal point. The moment captured perfectly.

#### 42. `unconquered` — Unconquered!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Seminole spear — honoring the unconquered Seminole Tribe of Florida
- **INACTIVE**: Simple upright spear/lance silhouette with a pointed tip and maybe feather decorations near the top. All in purple monochrome.
- **ACTIVE**: Ornate Seminole spear standing upright with detailed stone/flint spearhead, wrapped leather grip, eagle feathers tied near the head, and beadwork decorations. A traditional Seminole patchwork pattern band around the shaft. Earth tones — brown wood, gray flint, white/brown feathers, colorful patchwork (red, yellow, black Seminole pattern).

#### 43. `mangroveTunnels` — Mangrove Tunnel!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Mangrove tunnel kayak trail — paddling through arching red mangrove canopies
- **INACTIVE**: Arch/tunnel shape made of intertwining branch lines, with a small kayak silhouette inside. All in green monochrome.
- **ACTIVE**: Lush green mangrove tunnel with arching red mangrove roots and canopy forming a natural tunnel over calm water. A kayak paddling through the center. Dappled sunlight filtering through leaves. Rich greens, brown root tangles, calm teal-green water, the small colorful kayak as a focal point.

#### 44. `kerouac` — On the Road!
- **Category**: Heritage (`#A78BFA` purple)
- **Description**: Jack Kerouac's typewriter — the Beat Generation author spent his final years in St. Petersburg
- **INACTIVE**: Simple typewriter silhouette — boxy shape with a paper sheet sticking up from the top. All in purple monochrome.
- **ACTIVE**: Vintage manual typewriter (1950s style) with round keys, a sheet of paper rolled in with typed text visible, maybe a coffee cup beside it and a worn paperback book. Nostalgic warm tones — dark metal typewriter, cream paper, warm amber lighting. Beat Generation aesthetic.

#### 45. `bioluminescence` — Bioluminescence!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Bioluminescent bay glow — dinoflagellates light up Tampa Bay waters with ethereal blue-green light
- **INACTIVE**: Simple wavy water lines with a few small glowing dots/sparkles along them. All in green monochrome.
- **ACTIVE**: Magical nighttime water scene with brilliant electric blue-green bioluminescent glow in the water. A kayak paddle creating a trail of glowing light. Dark night sky above, but the water is alive with swirling neon blue-green light from the dinoflagellates. Ethereal, magical feel. Deep dark blue-black night, vivid cyan-green glow in water.

---

### BATCH 10: Florida Icons (5 icons × 4 variants = 20 PNGs)

#### 46. `floridaMan` — Florida Man!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Florida Man — the beloved internet meme born from Florida's public records laws and wild news headlines
- **INACTIVE**: Simple male figure silhouette in a casual/wild pose — maybe arms raised triumphantly or running. All in gold monochrome.
- **ACTIVE**: Comedic "Florida Man" figure — a sunburned dude in cargo shorts, flip-flops, tank top, and sunglasses, striking a triumphant pose. Maybe holding a newspaper with "FLORIDA MAN" headline. Palm tree behind him. Humorous and exaggerated. Bright sunny colors, comedic energy.

#### 47. `hurricaneAlley` — Hurricane Alley!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Hurricane spiral — Tampa Bay sits in Hurricane Alley, most vulnerable metro for storm surge
- **INACTIVE**: Simple spiral shape (hurricane from above) with a dot in the center (eye). All in green monochrome.
- **ACTIVE**: Dramatic satellite-view hurricane spiral with well-defined eye in the center, swirling cloud bands in white/gray, dark blue ocean beneath. Rain bands spiraling outward. Atmospheric and powerful — whites, grays, deep blue. The eye is clear and distinct.

#### 48. `redTide` — Red Tide!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Red tide algae bloom — Karenia brevis blooms that periodically affect Gulf beaches
- **INACTIVE**: Wavy water lines with a reddish-brown tint/wash spreading through them. All in green monochrome.
- **ACTIVE**: Coastal scene showing reddish-brown discolored water (the algal bloom) meeting normal blue-green water. Dead fish floating on the surface. Beach shoreline visible. The contrast between the murky red-brown bloom water and clean blue water is key. Warning/cautionary feel.

#### 49. `honeymoonIsland` — Honeymoon Island!
- **Category**: Landmarks (`#FBBF24` gold)
- **Description**: Honeymoon Island palm — the state park was a 1940s honeymoon resort, now one of Florida's most-visited parks
- **INACTIVE**: Simple palm tree silhouette leaning over a small island/sandbar shape. All in gold monochrome.
- **ACTIVE**: Idyllic tropical island scene — a leaning coconut palm tree on a small white sand beach, crystal-clear turquoise water, maybe a pair of Adirondack chairs or a small dock. Bright sunny tropical paradise feel. White sand, turquoise water, green palm, blue sky.

#### 50. `ghostOrchid` — Ghost Orchid!
- **Category**: Nature (`#4ADE80` green)
- **Description**: Ghost orchid in bloom — the rare, ethereal flower found in Florida swamps, made famous by "The Orchid Thief"
- **INACTIVE**: Simple flower shape with elongated petals floating/hanging — the orchid's distinctive angular shape. All in green monochrome.
- **ACTIVE**: Ethereal white ghost orchid with its distinctive frog-like shape — two long lateral petals and a lip petal that looks like dangling legs. Attached to a dark tree trunk with visible aerial roots (no leaves — ghost orchids are leafless). Dark swamp background with soft light illuminating the pure white flower. Magical, rare, otherworldly.

---

### BATCH 12: Game Day (3 icons × 4 variants = 12 PNGs)

#### 51. `raysBaseball` — Rays Up!
- **Category**: Sports (`#F87171` red)
- **Description**: Tampa Bay Rays sunburst baseball — the Rays have called St. Petersburg home since 1998
- **INACTIVE**: Simple baseball silhouette with curved stitching lines and a small sunburst/ray pattern. All in red monochrome.
- **ACTIVE**: White baseball with red stitching and a yellow sunburst pattern (the Rays' logo style) radiating from behind it. A bat leaning against the ball. Bright, energetic sports feel. White ball, red stitching, yellow sunburst rays, wooden bat.

#### 52. `golfFlag` — Fore!
- **Category**: Sports (`#F87171` red)
- **Description**: Golf flag on the green — Innisbrook's Copperhead Course hosts the PGA Tour's Valspar Championship
- **INACTIVE**: Simple flag on a stick in a small circle (hole). All in red monochrome.
- **ACTIVE**: Golf pin/flag on a manicured green with the flag waving in the breeze. A golf ball nearby on the putting surface, rolling toward the hole. Lush green grass, white flag with a number, white golf ball. Clean, pristine golf course feel. Palm trees in the distant background (it's Florida).

#### 53. `horseRacing` — And They're Off!
- **Category**: Sports (`#F87171` red)
- **Description**: Thoroughbred horse racing — Tampa Bay Downs in Oldsmar has hosted live racing since 1926
- **INACTIVE**: Simple horse silhouette in galloping pose with a small jockey figure on top. All in red monochrome.
- **ACTIVE**: Thoroughbred racehorse at full gallop with jockey in colorful silks leaning forward, dirt/turf kicking up behind the hooves. Dynamic action pose — muscles and motion. Rich brown horse, colorful jockey silks (red, blue, yellow), flying dirt, racetrack rail in background.

---

## BEST OF THE BAY ICONS — Gold Silhouette Style

> **Reminder**: Best of Bay icons are ALWAYS shown prominently (no inactive state). They use a **gold silhouette** aesthetic — think gold foil stamp, award badge, or luxury emblem. Primary color is gold `#FBBF24` (light mode) / `#D4A04A` (dark mode). Each icon gets 2 variants: `_light.png` and `_dark.png`.

### BATCH 11: Best of the Bay (12 icons × 2 variants = 24 PNGs)

#### B1. `bernsSteak` — Bern's Steak House
- **Description**: Sizzling steak icon — Bern's legendary steakhouse, a Tampa institution since 1956
- **Visual**: Gold silhouette of a thick-cut steak on a sizzling plate/skillet, with small steam/sizzle lines rising. The steak should have grill marks. Elegant, appetizing. Pure gold on transparent background.

#### B2. `flamencoDancer` — Columbia Restaurant
- **Description**: Flamenco dancer — Florida's oldest restaurant (1905) in Ybor City with nightly flamenco shows
- **Visual**: Gold silhouette of a flamenco dancer mid-twirl, arms raised, ruffled dress fanning out dramatically. Dynamic, elegant pose capturing the energy of the dance. Pure gold on transparent background.

#### B3. `pirateShipBow` — Raymond James Stadium
- **Description**: Touchdown cannon — the 103-foot pirate ship inside Raymond James Stadium that fires after every Bucs score
- **Visual**: Gold silhouette of a pirate ship bow/prow with a cannon firing (small blast/smoke puff). The bow has ornate carved details. This is the STADIUM ship, not a sailing vessel — it's a fixed structure with cannons. Pure gold on transparent background.

#### B4. `lightningBolt` — Amalie Arena
- **Description**: Lightning bolt strike — home of the Tampa Bay Lightning hockey team
- **Visual**: Gold silhouette of a bold, angular lightning bolt (sports/team logo style, not weather). Clean, powerful, geometric. Maybe with a subtle ice/arena floor line beneath it. Pure gold on transparent background.

#### B5. `meltingClock` — The Dali Museum
- **Description**: Dali melting clock — The Dali Museum in St. Pete houses the largest collection of Salvador Dali works outside Spain
- **Visual**: Gold silhouette of a Dali-style melting/drooping clock draped over the edge of a surface, the face distorted and flowing. Surrealist style. The clock hands visible but warped. Pure gold on transparent background.

#### B6. `cigarIcon` — Ybor City
- **Description**: Ybor rooster — the wild chickens that roam Ybor City's historic streets, descendants of those kept by cigar workers
- **Visual**: Gold silhouette of a proud rooster standing with tail feathers fanned up, chest puffed out, beak open mid-crow. Detailed feather silhouette. NOT a cigar — this is the ROOSTER icon. Pure gold on transparent background.

#### B7. `bridgeArch` — Tampa Riverwalk
- **Description**: Riverwalk lamp post — the ornamental street lamps lining the 2.6-mile Tampa Riverwalk waterfront promenade
- **Visual**: Gold silhouette of an elegant ornamental street lamp/lamp post (Victorian or Art Deco style) with a glowing light at the top. Maybe a subtle railing/walkway line beneath it suggesting the riverwalk. Pure gold on transparent background.

#### B8. `ringlingCircus` — The Ringling
- **Description**: Circus tent — The Ringling Museum in Sarasota, John Ringling's legacy
- **Visual**: Gold silhouette of a classic big-top circus tent with peaked top, pennant flag, and scalloped entrance. The grand, old-fashioned circus tent shape. Maybe a small ring/circle suggesting the performance ring inside. Pure gold on transparent background.

#### B9. `beachUmbrella` — Clearwater Beach
- **Description**: Beach umbrella — Clearwater Beach, consistently ranked America's #1 beach
- **Visual**: Gold silhouette of a tilted beach umbrella planted in sand with a beach chair beside it. Simple, iconic beach scene. Maybe a small wave line suggesting the shore. Pure gold on transparent background.

#### B10. `palmTree` — Siesta Key Beach
- **Description**: Starfish on quartz sand — Siesta Key's 99% pure quartz crystal sand that stays cool
- **Visual**: Gold silhouette of a starfish resting on a small sand mound/dune with a palm tree behind it. The starfish is the PRIMARY element (not the palm tree). Detailed five-armed starfish shape. Pure gold on transparent background.

#### B11. `guitarSilhouette` — Seminole Hard Rock
- **Description**: Guitar silhouette — Seminole Hard Rock Hotel & Casino, the guitar-shaped landmark
- **Visual**: Gold silhouette of an electric guitar (the iconic Hard Rock guitar shape), standing upright. Clean, bold, instantly recognizable guitar outline. Maybe subtle building/hotel lines behind it suggesting the guitar-shaped tower. Pure gold on transparent background.

#### B12. `donCesar` — The Don CeSar
- **Description**: Pink palace towers — The Don CeSar, the iconic 1928 resort on St. Pete Beach known as the "Pink Palace"
- **Visual**: Gold silhouette of the Don CeSar hotel's distinctive architecture — twin towers, arched windows, Mediterranean Revival style with domed/peaked roofline. The building's unique roofline profile is key for recognition. Pure gold on transparent background.

---

## COMPLETE FILE LIST (236 PNGs)

### Easter Eggs (53 × 4 = 212 files)
For each of the 53 svgKeys listed above, generate these 4 files:
```
{svgKey}_inactive_light.png
{svgKey}_inactive_dark.png
{svgKey}_active_light.png
{svgKey}_active_dark.png
```

### Best of Bay (12 × 2 = 24 files)
For each of the 12 svgKeys listed above, generate these 2 files:
```
{svgKey}_light.png
{svgKey}_dark.png
```

### All 65 svgKeys:
**Easter Eggs**: pirateShip, kraken, skunkApe, strawberry, lightning, mermaid, cigar, dolphin, pelican, osprey, sandhillCrane, gopherTortoise, alligator, roseateSpoonbill, seaTurtle, skywayBridge, spongeDiver, hockeyPuck, pirateFlag, stingray, greekCross, cubanSandwich, grouper, orange, craftBeer, flamingo, tikiHut, ufo, conchShell, treasureChest, gibsonton, spookHill, joyland, babeRuth, phosphateMining, sharkTooth, tarponFish, shipwreck, mantaRay, spanishMoss, greenFlash, unconquered, mangroveTunnels, kerouac, bioluminescence, floridaMan, hurricaneAlley, redTide, honeymoonIsland, ghostOrchid, raysBaseball, golfFlag, horseRacing

**Best of Bay**: bernsSteak, flamencoDancer, pirateShipBow, lightningBolt, meltingClock, cigarIcon, bridgeArch, ringlingCircus, beachUmbrella, palmTree, guitarSilhouette, donCesar

---

## RECOMMENDED AI GENERATION APPROACH

### Option A: ChatGPT + DALL-E (Manual but Free)
1. Create a ChatGPT Project and paste this entire document as project instructions
2. Ask it to generate icons one at a time or in small batches
3. Say: "Generate the pirateShip icon in all 4 variants: inactive_light, inactive_dark, active_light, active_dark. 128×128px PNG, transparent background."
4. Download and rename each file
5. Repeat for all 65 icons

### Option B: OpenAI API Script (Automated, ~$10-15)
1. Use the DALL-E 3 API with this spec as the system prompt
2. Loop through all 65 icons × their variants
3. Auto-download and name files correctly
4. Total cost: ~$0.04/image × 236 images = ~$9.44

### Option C: Canva AI / Midjourney
1. Use this spec as reference for individual prompts
2. For each icon, adapt the description into the tool's prompt format
3. Ensure transparent PNG export at 128×128px

---

## QUALITY CHECKLIST

Before using any generated icon, verify:
- [ ] Transparent background (no white/colored background)
- [ ] 128 × 128 pixels exactly
- [ ] Icon is centered with ~8px padding
- [ ] Inactive variants are clearly muted/simplified compared to active
- [ ] Dark mode variants have lighter strokes/fills (not just the same image)
- [ ] Best of Bay icons are gold silhouette style, not full-color illustrations
- [ ] Each icon is visually distinct — no two icons could be confused for each other
- [ ] File names match the exact svgKey naming convention
- [ ] Category colors are correct for each icon's inactive state

