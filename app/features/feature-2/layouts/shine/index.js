import classic from "./classic.json";
import minimal from "./minimal.json";
import rich from "./rich.json";
import landing from "./landing.json";
import lifestyle from "./lifestyle.json";
import showcase from "./showcase.json";

export const LAYOUTS = [
  {
    id: "classic",
    name: "Radiant Glow",
    description: "Slideshow, collection list, featured products with ranking, product hotspots, content collage, video banner, and blog posts",
    thumbnail: "\u2728",
    template: classic,
  },
  {
    id: "minimal",
    name: "Crystal Clear",
    description: "Full-screen slideshow, product carousel, collection list, countdown banner, testimonials, timeline, and blog posts",
    thumbnail: "\u{1F48E}",
    template: minimal,
  },
  {
    id: "rich",
    name: "Golden Hour",
    description: "Text hero, collection list, timeline, image banner, countdown, product carousel, content collage, address list, and newsletter",
    thumbnail: "\u{1F31F}",
    template: rich,
  },
  {
    id: "landing",
    name: "Spotlight",
    description: "Hero with categories, running content, featured collections, video banner, countdown, slideshow, icon features, timeline, and newsletter",
    thumbnail: "\u{1F4A1}",
    template: landing,
  },
  {
    id: "lifestyle",
    name: "Luminous Life",
    description: "Hero banner, slideshow, product carousel, collection list, countdown, testimonials, video banner, image with text, timeline, and newsletter",
    thumbnail: "\u{1F31E}",
    template: lifestyle,
  },
  {
    id: "showcase",
    name: "Diamond Display",
    description: "Text hero, running content, content collage, product hotspots, featured collections, image banner, icon features, logo list, blog posts, and address list",
    thumbnail: "\u{1F48D}",
    template: showcase,
  },
];
