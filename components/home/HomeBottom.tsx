import type { ReactNode } from "react";
import "./home-bottom.css";
import HomeParallax from "./HomeParallax";

/** "An Artist" → photo (held still, uncovered by "An Artist" as you scroll) fading into blue → "An Essential" (centred, 75% of the page width)
 *  → short fade into #030392 → footer. The footer is passed in as children. */
export default function HomeBottom({ children }: { children?: ReactNode }) {
  return (
    <section className="hb" aria-label="An Artist, An Essential">
      <HomeParallax />
      <div className="hb-top">
        <div className="hb-fit">
          <h2 className="hb-line hb-artist">An Artist</h2>
        </div>
      </div>

      <div className="hb-photo" data-hb-pin>
        <div className="hb-photo-layer">
          <img src="/protfoliobottom.webp" alt="" loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="hb-blue">
        <div className="hb-half">
          <h2 className="hb-line hb-essential">An Essential</h2>
        </div>
        <div className="hb-fade" aria-hidden />
      </div>

      <div className="hb-end">{children}</div>
    </section>
  );
}
