import './hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <h1 className="sr-only">RAWME ARZU</h1>
      <picture>
        <source media="(max-aspect-ratio: 1/1)" srcSet="/hero-mobile.svg" />
        <img className="hero-art" src="/hero-desktop.svg" alt="" />
      </picture>
      <span className="hero-dot hero-dot--tl" />
      <span className="hero-dot hero-dot--br" />
    </section>
  );
}
