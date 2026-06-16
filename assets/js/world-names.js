// Trail Log — world-map English short names.
// Seeded from common English short-form country names; Intl.DisplayNames fills
// in standard ISO-2 regions offline, with overrides for inverted/formal names.

const WORLD_REGION_SHORT_NAMES = Object.freeze({
  AE: "United Arab Emirates",
  BO: "Bolivia",
  BN: "Brunei",
  BQ: "Caribbean Netherlands",
  CD: "DR Congo",
  CG: "Congo",
  CI: "Cote d'Ivoire",
  CV: "Cape Verde",
  CZ: "Czechia",
  FK: "Falkland Islands",
  FM: "Micronesia",
  GB: "United Kingdom",
  IR: "Iran",
  KP: "North Korea",
  KR: "South Korea",
  LA: "Laos",
  MD: "Moldova",
  MK: "North Macedonia",
  PS: "Palestine",
  RU: "Russia",
  SH: "St. Helena",
  SY: "Syria",
  TZ: "Tanzania",
  US: "United States",
  VA: "Vatican City",
  VE: "Venezuela",
  VN: "Vietnam",
  XK: "Kosovo"
});

const WORLD_REGION_DISPLAY_NAMES = (() => {
  try {
    return typeof Intl !== "undefined" && Intl.DisplayNames
      ? new Intl.DisplayNames(["en"], { type: "region", style: "short" })
      : null;
  } catch {
    return null;
  }
})();

function worldRegionShortName(code, fallback = "") {
  const key = String(code || "").toUpperCase();
  const override = WORLD_REGION_SHORT_NAMES[key];
  if (override) return override;
  const displayed = WORLD_REGION_DISPLAY_NAMES?.of?.(key);
  return String(displayed || fallback || key)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
