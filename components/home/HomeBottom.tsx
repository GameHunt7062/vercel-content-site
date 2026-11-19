import type { ReactNode } from "react";
import "./home-bottom.css";

/** "An Artist" → photo fading into solid blue → "An Essential" (centred, half the page width) → footer.
 *  The blue runs from the photo's bottom to the very end of the page, so the footer is passed in as children. */
export default function HomeBottom({ children }: { children?: ReactNode }) {
  return (
    <section className="hb" aria-label="An Artist, An Essential">
      <div className="hb-fit">
        <h2 className="hb-line hb-artist">An Artist</h2>
      </div>

      <div className="hb-photo">
        <img src="/protfoliobottom.webp" alt="" loading="lazy" decoding="async" />
      </div>

      <div className="hb-blue">
        <div className="hb-half">
          <h2 className="hb-line hb-essential">An Essential</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
