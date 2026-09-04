import Link from "next/link";

export default function ArtworkCard({ artwork }: { artwork: any }) {
  return (
    <Link href={`/art/${artwork.slug}`} className="group">
      <img src={artwork.image_url} alt={artwork.title} className="aspect-square w-full object-cover rounded-xl group-hover:opacity-90" />
      <h3 className="font-semibold mt-3">{artwork.title}</h3>
      {artwork.category && <p className="text-sm text-zinc-500">{artwork.category}</p>}
    </Link>
  );
}