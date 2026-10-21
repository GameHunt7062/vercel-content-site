import './hero.css';
import { HeroArtDesktop, HeroArtMobile } from "@/components/HeroArt";
import HeroIntro from "@/components/HeroIntro";
import HeroParallax from "@/components/HeroParallax";

export default function Hero() {
  return (
    <section className="hero">
      <h1 className="sr-only">RAWME ARZU</h1>
      <HeroArtDesktop />
      <HeroArtMobile />
      <span className="hero-dot hero-dot--tl" />
      <span className="hero-dot hero-dot--br" />
      <HeroIntro />
      <HeroParallax />
    </section>
  );
}
