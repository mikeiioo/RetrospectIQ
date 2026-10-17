/** Google Maps URL that opens a search for the address (no API key needed). */
export function googleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
