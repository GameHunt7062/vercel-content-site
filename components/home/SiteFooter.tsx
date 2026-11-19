import HomeBottom from "./HomeBottom";
import HomeFooter from "./HomeFooter";

/** The whole bottom of the site: "An Artist" → photo → "An Essential" → footer card, in blue down to the end of the page.
 *  Used on the home page, /articles and every /article/... page, so they all end the same way. */
export default function SiteFooter() {
  return (
    <HomeBottom>
      <HomeFooter />
    </HomeBottom>
  );
}
