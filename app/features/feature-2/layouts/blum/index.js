import classic from "./classic.json";
import minimal from "./minimal.json";
import rich from "./rich.json";
import landing from "./landing.json";
import lifestyle from "./lifestyle.json";
import showcase from "./showcase.json";

export const LAYOUTS = [
  {
    id: "classic",
    name: "Tokyo Modern",
    description: "Slideshow, collection list, featured products with ranking, product hotspots, content collage, video banner, and blog posts",
    thumbnail: "\u{1F5FC}",
    template: classic,
  },
  {
    id: "minimal",
    name: "Athleisure",
    description: "Full-screen slideshow, product carousel, collection list, countdown banner, testimonials, timeline, and blog posts",
    thumbnail: "\u{1F3CB}",
    template: minimal,
  },
  {
    id: "rich",
    name: "Artisan Crafts",
    description: "Text hero, collection list, timeline, image banner, countdown, product carousel, content collage, address list, and newsletter",
    thumbnail: "\u{1F3A8}",
    template: rich,
  },
  {
    id: "landing",
    name: "Fashion Forward",
    description: "Hero with categories, running content, featured collections, video banner, countdown, slideshow, icon features, timeline, and newsletter",
    thumbnail: "\u{1F680}",
    template: landing,
  },
  {
    id: "lifestyle",
    name: "Lifestyle Hub",
    description: "Hero banner, slideshow, product carousel, collection list, countdown, testimonials, video banner, image with text, timeline, and newsletter",
    thumbnail: "\u{1F3E0}",
    template: lifestyle,
  },
  {
    id: "showcase",
    name: "Showcase Gallery",
    description: "Text hero, running content, content collage, product hotspots, featured collections, image banner, icon features, logo list, blog posts, and address list",
    thumbnail: "\u{1F5BC}",
    template: showcase,
  },
];
