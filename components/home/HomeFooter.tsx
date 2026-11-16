import { createClient } from "@/lib/supabase/server";
import { normalizeHomeProfile, safeHref, socialUrl, SOCIALS } from "@/lib/homeProfile";
import { BRAND_ICONS, GlyphMail } from "./icons";
import "./home-profile.css";

/** Footer at the very bottom of the home page. Social icons come from the "Where to find me" card. */
export default async function HomeFooter() {
  const supabase = await createClient();
  const { data: row } = await supabase.from("home_profile").select("data").eq("id", 1).maybeSingle();
  const { find, footer } = normalizeHomeProfile(row?.data);
  if (!footer.visible) return null;

  const socials = find.items
    .map((it) => ({ it, url: socialUrl(it) }))
    .filter((x) => x.url); // Discord usernames without a link are skipped
  const contact = safeHref(footer.contactHref);

  return (
    <footer className="max-w-[88rem] mx-auto px-4 md:px-8 mt-14 md:mt-24">
      <div className="hp-footer">
        {footer.peekImage && <img src={footer.peekImage} alt="" className="hp-footer-peek" />}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {socials.map(({ it, url }) => {
              const Icon = BRAND_ICONS[it.platform];
              return (
                <a key={it.id} href={url} target="_blank" rel="noopener noreferrer" className="hp-social" aria-label={SOCIALS[it.platform].name}>
                  <Icon />
                </a>
              );
            })}
          </div>
        )}

        <div className="hp-footer-line" />

        <div className="flex items-center justify-between gap-4">
          <span className="hp-footer-brand">{footer.brand}</span>
          {contact ? (
            <a href={contact} {...(/^https?:/.test(contact) ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="hp-contact">
              <GlyphMail /> {footer.contactLabel || "Contact"}
            </a>
          ) : (
            // email not set yet (Admin → Home page cards → Footer): button is visible but not clickable
            <span className="hp-contact" aria-disabled="true">
              <GlyphMail /> {footer.contactLabel || "Contact"}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
