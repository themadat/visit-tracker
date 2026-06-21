## Future Prompt

 - implement shortcuts in the popups: 
    - Notes Priority
    - Maps Grid
    - Rangefinder Circle
    - Rangefinder Time

1. Instead of clipping text in rangefinder start or end break it into two lines when overflowing; Where on top and city on bottom shrinking the text so it doesn't take up any more vertical space than given to it with one line
3. When switching to scrollable map mode the buttons on the right all shift up a little and are no longer in alignment. Similar behavior happens when enabling rangefinder. this shouldn't happen.
4. Change the label dropdown shortcut from "~" to "'" and just have it cycle between the options instead of bringing up the popup
5. instead of 1,2,3 have the label toggle just cycle through its options with left arrow
6. Re-arrange the map buttons and update their shortcuts: switch map scroll/fit (9); Grid (8), Rangefinder (7), Pins (6), Filter (5)
7. For the copy button float it above the notes container on the right side so it doesn't bump down or cover up text
8. Grid Pop-up: All buttons should be square with text above them (Grid, Circles, Labels, Major, Minor). The drop downs should be same square size as the buttons
9. RangeFinder circle pop-up should stay as a 2x2 grid with button symbols but move the words out to be Fill/Clip on the left and No/Yes on the top
10. RangeFinder Time popup should just two squares with text above. one button for Time, one input for Speed
11. Tighten up the spacing on priority pop-up
14. change wayfinder shortcut to "F"; give priority button "R"; legend position (W), Auto categories (X), Edit Legend (Y), Add Legend Level (Z); Auto Colors (T); edit rangefinder (J); Add Rangefinder (K), Drive/Fly (U), mph/kph (V); Circles (R)

## Maps
Blank World Map with Circles: https://commons.wikimedia.org/wiki/File:BlankMap-World-with-Circles.svg
Blank World Map: https://commons.wikimedia.org/wiki/File:BlankMap-World.svg

Robinson 2025 Physical World Map (United Nations) :: 
  https://commons.wikimedia.org/wiki/File:Physical_World_Map_(United_Nations).svg
  https://upload.wikimedia.org/wikipedia/commons/7/74/Physical_World_Map_%28United_Nations%29.svg

Robinson 2021 CIA WorldFactBook-Political World :: 
  https://commons.wikimedia.org/wiki/File:CIA_WorldFactBook-Political_world.pdf
  https://upload.wikimedia.org/wikipedia/commons/6/6a/CIA_WorldFactBook-Political_world.pdf

Robinson Political Map 2005 :: 
  https://upload.wikimedia.org/wikipedia/commons/9/93/%22Political_World%22_CIA_World_Factbook_map_2005.svg

Maybe this is a better us map where hawaii and alaska are mercartor:
  https://commons.wikimedia.org/wiki/File:Usa_edcp_(%2BHI_%2BAK)_location_map.svg

Used these images and this tool to tweak grids and get result: 
  US: https://www.aaroads.com/blog/wp-content/uploads/gis-classes/albers-overview-map.png
  Alaska: https://geospatialdesktop.com/files/gmt_alaska_coast.png
  Exact Lat/Lon: https://epsg.io/map#srs=4326&x=-140.890045&y=67.044145&z=4&layer=streets

const US_GRATICULE_CALIBRATION = {
  mainland: {
    southWest: { x: 36.43, y: 414.15 },
    southMiddle: { x: 405.76, y: 480.36 },
    southEast: { x: 782.67, y: 449.89 },
    northWest: { x: 133.84, y: -3.06 },
    northMiddle: { x: 419.4, y: 37.82 },
    northEast: { x: 707.4, y: 18.19 }
  },
  alaska: {
    southWest: { x: 59.42, y: 572.15 },
    southMiddle: { x: 115.9, y: 584.03 },
    southEast: { x: 165.13, y: 587.68 },
    northWest: { x: 89.63, y: 484.15 },
    northMiddle: { x: 125.76, y: 491.58 },
    northEast: { x: 164.53, y: 494.28 }
  }
};

## Colors

Ferrari:
Red (Rosso Corsa) corresponds to hex code #FF2800 (or sometimes #E80020 for the Formula 1 team)
Yellow (Giallo Modena): #FFF200
Black (Cavallino/Scuderia): #000000
White (Bianco Avus): #FFFFFF
Green: #00A551

Maclaren:
Blue #47CFFC
Oragne #FF8000

Vibrant: 
Blue: #0046FF
Orange: #FF8040

Earthy:
Navy Blue: #0e3b5c
Rust Orange: #d8897b 

Airy:
Light Blue: #00BFFF
Light/Bright Orange: #FFA630

Classic:
Deep Blue: #0050EF
Vibrant Orange: #FF7900 

Lamborghini might be the color pallette to go with (ferrari limiting and maclaren not quite the hues I want)

#9B0E1F (Mercury Red)
#A80115 (volcano red)
#C82504 (volcano orange)
#FFC43D (mclaren orange)
#63EA2E (mantis)
#2F473A (Racing Green)
#00B8EE (Curacao blue)
#0149D3 (vegas blue)
#172375 (aurora blue)
#351175 (Lantana Purple)
#C8659E (Colbalt Violet)
#191A1E (Fire black)
#29324E (saffire Black)
#626876 (maclaren argon)
#8C8D92 (Storm gray)
#9BA2B4 (titanium silver)
#C4C8D4 (Ice silver)
#EBEBEB (Pearl White)

### Icon

<!-- 70% <g transform="translate(228 164) scale(21)"> -->
<!-- 80% <g transform="translate(177 112) scale(24.77)"> -->

<comment name="PineShadow" fill="#243127" />
<comment name="PineMist" fill="#D6E7D8" />
<comment name="DeepLeatherBrown" fill="#5A3E2B" />
<comment name="WarmSaddleBrown" fill="#8B5E3C" />
<comment name="TrailDustTan" fill="#B79B7A" />
<comment name="AgedPaperCream" fill="#E8DCC8" />
<comment name="ForestGreene" fill="#355E3B" />
<comment name="MossGreen" fill="#6B8F4E" />
<comment name="AmberGold" fill="#E3A93B" />
<comment name="BrightCompassGold" fill="#F2C14E" />
<!-- Unused Below -->
<comment name="CompassGold" fill="#C2A15A" />
<comment name="BrightAdventureGold" fill="#D4AF37" />
<comment name="SunlitGold" fill="#E0B84F" />

## Names

Trail Log <- [Travel Log, Trail Notes, Book/Journal] <- Visit Tracker  <- US State Visit Map
| Profession / Hobby | Common Term
|---|---|
Journalists | Field Notes
Pilots | Logbook
Hikers | Trail Journal
Scientists | Field Journal
Sailors | Ship’s Log
Engineers | Engineering Notebook
Developers | Dev Log
Photographers | Shoot Log
Military | Field Book
EMS / Fire | Incident Log
Birders | Observation Log
Fishermen | Catch Log
Divers | Dive Log
Climbers | Ascent Log
Astronomers | Observing Log
Ham Radio Operators | QSO Log
Gardeners | Garden Journal
Travelers | Travel Journal
Artists | Sketchbook
Mechanics | Maintenance Log

## SVG Stuff

// Find Free Custom SVGs: https://www.svgrepo.com
https://www.svgrepo.com/collection/travel-and-places-infographic-icons/
https://www.svgrepo.com/collection/gis-mapping-icons/
https://www.svgrepo.com/collection/monuments/
https://www.svgrepo.com/collection/travelling/

Continents (Filled): Africa, Antarctica, South America
Continents (Lines): Africa, North America, South America
Missing Continents: Asia, Europe (Full), Oceania (Full), North America (Filled)
Other Have: EU, Texas

Missing Countries (default from coutricons, if svgrepo in name then Other Source; not as rounded, but more exact which I prefer)
Africa
Missing 13: Benin, Chad, Comoros, Democratic Republic of the Congo, Eswatini, Ethiopia, Madagascar, Mozambique, Nigeria, Republic of the Congo, Sao Tome and Principe, Tanzania, Uganda.

Asia
Missing 14: Armenia, Bahrain, Cambodia, Cyprus, Iraq, Kuwait, Lebanon, Maldives, Nepal, Qatar, Sri Lanka, Tajikistan, Turkmenistan, Vietnam.

Europe
Missing 8: Greece, Hungary, Iceland, Lithuania, Moldova, Monaco, Romania, San Marino.

North America
Missing 9: Antigua and Barbuda, Barbados, Costa Rica, Dominica, Dominican Republic, Honduras, Jamaica, Panama, Saint Vincent and the Grenadines.

Oceania
Missing 11: Australia, Fiji, Kiribati, Marshall Islands, Micronesia, Nauru, New Zealand, Papua New Guinea, Samoa, Solomon Islands, Tuvalu.

South America
Missing 2: Ecuador, Guyana.

<!-- Bubbly Flute
<svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 3h8l-1 11a3 3 0 0 1-6 0zM12 17v4M9 21h6" />
  <circle cx="11" cy="8" r=".75" fill="currentColor" />
  <circle cx="13" cy="10" r=".75" fill="currentColor" />
</svg>-->

<!-- Glass with Rock
<svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M6 7h12l-1 13H7zM9 10h4v4H9zM9 10l-1 1M13 10l1 1" />
</svg>-->

<!-- Simple House Rail
<svg version="1.1" class="sf-symbol" xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 32 32"
  xml:space="preserve">
  <g>
    <path d="M23,18H9l-0.984-4.69C7.899,12.624,8.436,12,9.141,12h13.718c0.705,0,1.242,0.624,1.125,1.309L23,18z M17.913,11l0.888-4H24c1.323,0,1.325-2,0-2h-6.802l-1.334,6H17.913z" />
    <path d="M22.84,19l-1.26,8.06C21.49,27.604,21.023,28,20.471,28h-8.941c-0.553,0-1.02-0.396-1.109-0.941 L9.16,19H22.84z M7.142,13.475C6.925,12.181,7.924,11,9.237,11h3.003c-0.807-1.205-2.18-2-3.74-2C6.015,9,4,11.015,4,13.5 c0,2.305,1.739,4.183,3.973,4.447L7.142,13.475z" />
  <g>
</svg>-->

<!-- Simple Martini
<svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 5h16L12 14zM12 14v6M8 21h8M15 5l1-2 3 1" />
</svg>-->

<!-- Simple Martini Filled
<svg class="sf-symbol" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z" />
  </g>
</svg>-->

<!-- Neat Pour
svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M6 6h12l-1 14H7zM7.5 13h9" />
</svg>-->

<!-- Bottle
<svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10 3h4v5l2 3v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8l2-3zM10 8h4" />
</svg>-->

<!-- Bubbly Flute (Something Nice)
<svg viewBox="0 0 24 24">
  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 3h8l-1 11a3 3 0 0 1-6 0zM12 17v4M9 21h6" />
  <circle cx="11" cy="8" r=".75" fill="currentColor" />
  <circle cx="13" cy="10" r=".75" fill="currentColor" />
</svg>-->
