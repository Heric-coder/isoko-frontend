/**
 * Rwanda's 5 provinces and 30 districts — stable, official, safe to hardcode.
 * Sector and Cell (416 sectors / 2,148 cells) are entered as free text below
 * district level rather than bundled here, to keep the initial JS bundle
 * light on slow connections. If you want full cascading dropdowns all the
 * way down, fetch a sectors/cells JSON lazily (e.g. on district change)
 * instead of importing it eagerly — see README "Extending location data".
 */
export const RWANDA_PROVINCES: Record<string, string[]> = {
  Kigali: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  Northern: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  Southern: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  Eastern: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  Western: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
}

export const PROVINCES = Object.keys(RWANDA_PROVINCES)
