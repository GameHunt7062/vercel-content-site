import Link from "next/link";
import "@/components/articles/articles.css";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import ArticleDots from "@/components/articles/ArticleDots";

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
};

const PILLS: [string, string][] = [
  ["#b3261e", "#ffffff"],
  ["#cfe8ff", "#0a3d7a"],
  ["#e6defa", "#4a2d96"],
  ["#d6f5e3", "#14683a"],
  ["#ffe9c7", "#8a4b00"],
  ["#ffd9ec", "#a10058"],
];
function pill(category: string) {
  let h = 0;
  for (const c of category) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PILLS[h % PILLS.length];
}

function shortDate(iso: string) {
  const d = new Date(iso);
  const tz = "Asia/Kolkata";
  const sameYear = d.toLocaleDateString("en", { year: "numeric", timeZone: tz }) ===
    new Date().toLocaleDateString("en", { year: "numeric", timeZone: tz });
  return d
    .toLocaleDateString("en", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }), timeZone: tz })
    .toUpperCase();
}

export default async function Articles() {
  const supabase = await createClient();
  const admin = await getAdminUser();

  // Admin ko drafts bhi dikhte hain (RLS bhi sirf admin ko drafts deta hai); baaki sab ko sirf published.
  let query = supabase
    .from("articles")
    .select("id,slug,title,excerpt,category,status,cover_image,published_at,created_at");
  query = admin
    ? query.order("created_at", { ascending: false })
    : query.eq("status", "published").order("published_at", { ascending: false });
  const { data } = await query;
  const articles = (data ?? []) as Row[];

  return (
    <div className="arts-page">
      <ArticleDots />
      <main className="arts-wrap">
        <div className="arts-head">
          <h1 className="arts-title">Articles</h1>
          {articles.length > 0 && (
            <p className="arts-count">{articles.length} {articles.length === 1 ? "article" : "articles"}</p>
          )}
        </div>

        {articles.length === 0 ? (
          <p className="arts-empty">No articles yet.</p>
        ) : (
          <div className="arts-grid">
            {articles.map((a) => {
              const [bg, fg] = a.category ? pill(a.category) : ["", ""];
              return (
                <article key={a.id} className="card arts-card">
                  {a.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.cover_image} alt="" className="arts-cover" loading="lazy" />
                  ) : (
                    <div className="arts-cover" aria-hidden />
                  )}
                  <div className="arts-body">
                    <p className="arts-date">
                      {shortDate(a.published_at ?? a.created_at)}
                      {a.status === "draft" && <b>Draft</b>}
                    </p>
                    <h2 className="arts-h">
                      <Link href={`/article/${a.slug}`}>{a.title}</Link>
                    </h2>
                    {a.excerpt && <p className="arts-ex">{a.excerpt}</p>}
                    <div className="arts-foot">
                      {a.category ? (
                        <span className="arts-pill" style={{ background: bg, color: fg }}>{a.category}</span>
                      ) : <span />}
                      <span className="arts-more">
                        View Article
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
