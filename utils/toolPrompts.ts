export type ToolName =
  | "colorpop"
  | "artpreview"
  | "gardenrender"
  | "objectswap"
  | "roomrender"
  | "stylesync"
  | "surfacestyle"
  | "canigetahottub"
  | "virtualstager";

// each function returns the DALL·E prompt for that tool
export const TOOL_PROMPTS: Record<ToolName, (visionDesc: string, extra?: string) => string> = {
  colorpop: (visionDesc, extra = "") =>
    `On this room photo—${visionDesc}—recolor the primary surface (walls or furniture) to ${extra}.`,
  artpreview: (visionDesc, extra = "") =>
    `Based on this space—${visionDesc}—generate framed wall art in a ${extra} motif.`,
  gardenrender: (visionDesc, extra = "") =>
    `Here's an outdoor space—${visionDesc}—fill it with furniture/greenery that is ${extra}.`,
  objectswap: (visionDesc, extra = "") =>
    `In this room photo—${visionDesc}—remove and replace objects as follows: ${extra}.`,
  roomrender: (visionDesc, extra = "") =>
    `Fully redesign this room—${visionDesc}—with these style instructions: ${extra}.`,
  stylesync: (visionDesc, extra = "") =>
    `Merge these inspiration styles—${visionDesc}—into this room. Create one seamless design: ${extra}.`,
  surfacestyle: (visionDesc, extra = "") =>
    `Transform the surface (floor or countertop) in this photo—${visionDesc}—into: ${extra}.`,
  canigetahottub: (visionDesc, extra = "") =>
    `Add a realistic hot tub to this room or outdoor space—${visionDesc}—per: ${extra}.`,
  virtualstager: (visionDesc, extra = "") =>
    `Stage this empty room—${visionDesc}—with furniture layout described by: ${extra}.`,
}; 