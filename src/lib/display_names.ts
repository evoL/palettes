import { ColorSpaceType, StopType } from "./types";

export const STOP_TYPES: Record<StopType, string> = {
  [StopType.BEZIER]: 'Bézier',
  [StopType.MANUAL]: 'Manual',
};

export const COLOR_SPACE_TYPES: Record<ColorSpaceType, string> = {
  [ColorSpaceType.OKLAB]: 'Oklab',
  [ColorSpaceType.OKLAB_LR]: 'Oklab (new lightness)'
};
