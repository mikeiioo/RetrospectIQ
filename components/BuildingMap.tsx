import { ExternalLinkIcon, MapPinIcon } from "@/components/icons";
import { googleMapsUrl } from "@/lib/maps";

/**
 * Square map preview of a building. The whole tile opens Google Maps in a new tab.
 * Uses the Maps Embed API when GOOGLE_MAPS_EMBED_API_KEY is set; otherwise shows a
 * styled placeholder that still links to Google Maps.
 */
export function BuildingMap({ name, address }: { name: string; address: string }) {
  const apiKey = process.env.GOOGLE_MAPS_EMBED_API_KEY;
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`
    : null;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      {embedUrl ? (
        <iframe
          title={`Map of ${name}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center bg-slate-50"
          style={{
            backgroundImage:
              "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/20">
            <MapPinIcon width={28} height={28} />
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 pt-12">
        <p className="truncate text-sm font-semibold text-white">{address}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-200">
          Open in Google Maps
          <ExternalLinkIcon width={14} height={14} />
        </p>
      </div>

      <a
        href={googleMapsUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${name} in Google Maps (new tab)`}
        className="absolute inset-0 rounded-2xl ring-blue-500 transition group-hover:bg-blue-500/5 focus-visible:ring-4"
      />
    </div>
  );
}
