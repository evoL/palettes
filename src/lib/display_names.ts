import { ColorSpaceType, StopType } from "./types";

export const STOP_TYPES: Record<StopType, string> = {
  [StopType.BEZIER]: 'Bézier',
  [StopType.MANUAL]: 'Manual',
};

export const COLOR_SPACE_TYPES: Record<ColorSpaceType, string> = {
  [ColorSpaceType.OKLAB]: 'Oklab',
  [ColorSpaceType.OKLAB_LR]: 'Oklab (Lr)'
};

export const LIGHT_OR_DARK: Record<0|1, string> = {
  0: "dark → light",
  1: "light → dark",
};
