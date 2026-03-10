import { LAYOUTS as blumLayouts } from "./blum/index";
import { LAYOUTS as shineLayouts } from "./shine/index";
import { LAYOUTS as electroLayouts } from "./electro/index";
import { LAYOUTS as normcoreLayouts } from "./normcore/index";

export const THEMES = [
  { key: "blum", name: "Blum", layouts: blumLayouts },
  { key: "shine", name: "Shine", layouts: shineLayouts },
  { key: "electro", name: "Electro", layouts: electroLayouts },
  { key: "normcore", name: "Normcore", layouts: normcoreLayouts },
];

export const getTheme = (key) => THEMES.find((t) => t.key === key) || THEMES[0];
