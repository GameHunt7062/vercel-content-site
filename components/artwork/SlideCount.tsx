/** Small number badge (bottom-right of an image) for artworks that have 2+ slides. Parent must be `relative`. */
export default function SlideCount({ count }: { count?: number }) {
  if (!count || count < 2) return null;
  return (
    <span
      aria-label={`${count} slides`}
      title={`${count} slides`}
      className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/75 text-white text-xs font-semibold px-2 py-1 leading-none"
    >
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </svg>
      {count}
    </span>
  );
}
