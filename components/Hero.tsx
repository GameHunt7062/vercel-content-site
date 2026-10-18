import './hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <h1 className="sr-only">RAWME ARZU</h1>
      <div className="hero-word" aria-hidden="true" />
      <div className="hero-cluster">
        <div className="hero-circle" />
        <img className="hero-head" src="/head.svg" alt="" />
      </div>
      <span className="hero-dot hero-dot--tl" />
      <span className="hero-dot hero-dot--br" />
    </section>
  );
}
