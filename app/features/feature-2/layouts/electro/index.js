import classic from "./classic.json";
import minimal from "./minimal.json";
import rich from "./rich.json";
import landing from "./landing.json";
import lifestyle from "./lifestyle.json";
import showcase from "./showcase.json";

export const LAYOUTS = [
  {
    id: "classic",
    name: "Neon Circuit",
    description: "Slideshow, collection list, featured products with ranking, product hotspots, content collage, video banner, and blog posts",
    thumbnail: "\u{1F50C}",
    template: classic,
  },
  {
    id: "minimal",
    name: "Pulse Beat",
    description: "Full-screen slideshow, product carousel, collection list, countdown banner, testimonials, timeline, and blog posts",
    thumbnail: "\u{1F3B5}",
    template: minimal,
  },
  {
    id: "rich",
    name: "Power Grid",
    description: "Text hero, collection list, timeline, image banner, countdown, product carousel, content collage, address list, and newsletter",
    thumbnail: "\u26A1",
    template: rich,
  },
  {
    id: "landing",
    name: "Overdrive",
    description: "Hero with categories, running content, featured collections, video banner, countdown, slideshow, icon features, timeline, and newsletter",
    thumbnail: "\u{1F3CE}",
    template: landing,
  },
  {
    id: "lifestyle",
    name: "Wired Living",
    description: "Hero banner, slideshow, product carousel, collection list, countdown, testimonials, video banner, image with text, timeline, and newsletter",
    thumbnail: "\u{1F916}",
    template: lifestyle,
  },
  {
    id: "showcase",
    name: "Voltage Gallery",
    description: "Text hero, running content, content collage, product hotspots, featured collections, image banner, icon features, logo list, blog posts, and address list",
    thumbnail: "\u{1F5B2}",
    template: showcase,
  },
];
