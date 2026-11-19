import type { ReactNode } from "react";
import "./home-bottom.css";
import HomeParallax from "./HomeParallax";

/** "An Artist" → photo fading into solid blue → "An Essential" (centred, 75% of the page width) → footer.
 *  The bright blue runs from the photo's bottom to under "An Essential", then fades into the dark #030392 end of the page where the footer sits (so the footer is passed in as children). */
export default function HomeBottom({ children }: { children?: ReactNode }) {
  return (
    <section className="hb" aria-label="An Artist, An Essential">
      <HomeParallax />
      <div className="hb-fit hb-artist-wrap" data-hb-px>
        <h2 className="hb-line hb-artist">An Artist</h2>
      </div>

      <div className="hb-photo" data-hb-px>
        <img src="/protfoliobottom.webp" alt="" loading="lazy" decoding="async" />
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
