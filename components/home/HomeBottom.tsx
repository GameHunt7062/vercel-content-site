import "./home-bottom.css";

/** "An Artist" → photo fading into solid blue → "An Essential". Sits between the cards and the footer. */
export default function HomeBottom() {
  return (
    <section className="hb" aria-label="An Artist, An Essential">
      <div className="hb-fit">
        <h2 className="hb-line hb-artist">An Artist</h2>
      </div>

      <div className="hb-photo">
        <img src="/protfoliobottom.webp" alt="" loading="lazy" decoding="async" />
      </div>

      <div className="hb-bottom">
        <div className="hb-fit">
          <h2 className="hb-line hb-essential">An Essential</h2>
        </div>
      </div>
    </section>
  );
}
