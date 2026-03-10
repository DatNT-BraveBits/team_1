import classic from "./classic.json";
import minimal from "./minimal.json";
import rich from "./rich.json";
import landing from "./landing.json";
import lifestyle from "./lifestyle.json";
import showcase from "./showcase.json";

export const LAYOUTS = [
  {
    id: "classic",
    name: "Clean Slate",
    description: "Slideshow, collection list, featured products with ranking, product hotspots, content collage, video banner, and blog posts",
    thumbnail: "\u{1F4CB}",
    template: classic,
  },
  {
    id: "minimal",
    name: "Basic Fit",
    description: "Full-screen slideshow, product carousel, collection list, countdown banner, testimonials, timeline, and blog posts",
    thumbnail: "\u{1F9E9}",
    template: minimal,
  },
  {
    id: "rich",
    name: "Raw Craft",
    description: "Text hero, collection list, timeline, image banner, countdown, product carousel, content collage, address list, and newsletter",
    thumbnail: "\u{1F9F5}",
    template: rich,
  },
  {
    id: "landing",
    name: "Everyday",
    description: "Hero with categories, running content, featured collections, video banner, countdown, slideshow, icon features, timeline, and newsletter",
    thumbnail: "\u2615",
    template: landing,
  },
  {
    id: "lifestyle",
    name: "Simple Living",
    description: "Hero banner, slideshow, product carousel, collection list, countdown, testimonials, video banner, image with text, timeline, and newsletter",
    thumbnail: "\u{1F33F}",
    template: lifestyle,
  },
  {
    id: "showcase",
    name: "Plain View",
    description: "Text hero, running content, content collage, product hotspots, featured collections, image banner, icon features, logo list, blog posts, and address list",
    thumbnail: "\u{1F4F7}",
    template: showcase,
  },
];
