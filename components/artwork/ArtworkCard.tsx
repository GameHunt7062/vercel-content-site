import Link from "next/link";
import { EditLink } from "@/components/admin/EditButton";

export default function ArtworkCard({ artwork }: { artwork: any }) {
  const slides = artwork.images?.length ?? 1;
  return (
    <div className="relative">
      <Link href={`/art/${artwork.slug}`} className="group block">
        <div className="relative">
          <img src={artwork.image_url} alt={artwork.title} className="aspect-square w-full object-cover rounded-xl group-hover:opacity-90" />
          {slides > 1 && (
            <span className="absolute bottom-2 left-2 rounded-md bg-black/70 text-white text-xs px-2 py-0.5">{slides} slides</span>
          )}
        </div>
        <h3 className="font-semibold mt-3">{artwork.title}</h3>
        {artwork.category && <p className="text-sm text-zinc-500 dark:text-zinc-400">{artwork.category}</p>}
      </Link>
      <EditLink href={`/admin/artwork/${artwork.id}`} />
    </div>
  );
}
