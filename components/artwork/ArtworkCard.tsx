import Link from "next/link";
import { EditLink } from "@/components/admin/EditButton";
import SlideCount from "@/components/artwork/SlideCount";

export default function ArtworkCard({ artwork }: { artwork: any }) {
  return (
    <div className="relative">
      <Link href={`/art/${artwork.slug}`} className="group block">
        <div className="relative">
          <div className="zoom-frame"><img src={artwork.image_url} alt={artwork.title} className="aspect-square w-full object-cover" /></div>
          <SlideCount count={artwork.images?.length} />
        </div>
        <h3 className="font-semibold mt-3 group-hover:text-rawme-pink">{artwork.title}</h3>
        {artwork.category && <p className="text-sm text-zinc-500 dark:text-zinc-400">{artwork.category}</p>}
      </Link>
      <EditLink href={`/admin/artwork/${artwork.id}`} />
    </div>
  );
}
