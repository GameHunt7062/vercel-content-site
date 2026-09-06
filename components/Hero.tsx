export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* split background: white on top, brand blue below — edit SPLIT_AT to move the line */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 44%, #000CFF 44%, #000CFF 100%)",
        }}
      />

      {/* RAWME — sits on the white band */}
      <h1
        className="hero-word absolute left-0"
        style={{ top: "16%", color: "#000CFF" }}
      >
        RAWME
      </h1>

      {/* ARZU — sits on the blue band */}
      <h1
        className="hero-word absolute left-0"
        style={{ top: "44%", color: "#ffffff" }}
      >
        ARZU
      </h1>

      {/* character cutout — TEMP placeholder pulled from your mockup.
          Swap the file at public/character-placeholder.png for your real
          transparent-bg image (same filename, or update src below). */}
      <img
        src="/character-placeholder.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          left: "46%",
          top: "0%",
          width: "54%",
          height: "83%",
          objectFit: "contain",
          objectPosition: "top right",
        }}
      />
    </section>
  );
}
