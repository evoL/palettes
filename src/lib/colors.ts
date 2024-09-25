import { ColorSpace, get as getCoord, parse, to as convert, toGamut, range, serialize, contrast, steps, display } from "colorjs.io/fn";
import type { ColorObject } from "colorjs.io/types/src/color";

export class ColorModel {
  #color: ColorObject;
  #inGamut?: ColorObject;
  
  constructor(color: ColorObject) {
    this.#color = color;
  }

  inGamut(space: ColorSpace): ColorObject {
    if (this.#inGamut == null) {
      this.#inGamut = toGamut(this.#color, {space});
    }
    return this.#inGamut;
  }

  clone(): ColorModel {
    return new ColorModel({ ...this.#color, coords: [...this.#color.coords] });
  }

  getInternal(): ColorObject {
    return this.#color;
  }

  toString() {
    return serialize(this.#color);
  }
}

export class ColorRamp {
  #keyColors: ColorModel[];
  #range?: RampRange;
  #darkColor?: ColorObject;
  #lightColor?: ColorObject;
  #colorSpace?: ColorSpace;

  get keyColors(): ColorModel[] {
    return this.#keyColors;
  }

  constructor(colors?: string[], public name: string = 'Color') {
    this.#keyColors = colors?.length ? colors.map(c => this.#newModel(c)) : [new ColorModel(randomColor())];
  }

  colorAt(lightness: number, space = ColorSpace.get('oklab')) {
    if (this.#colorSpace !== space) {
      this.#invalidate();
      this.#colorSpace = space;
    }
    if (!this.#range) {
      this.#range = generateRampRange(this.#keyColors.map(c => c.getInternal()), this.#colorSpace);
    }

    return this.#range(lightness);
  }

  contrastColorAt(lightness: number, space = ColorSpace.get('oklab')) {
    const color = this.colorAt(lightness, space);
    if (!this.#darkColor) this.#darkColor = this.colorAt(.3, space);
    if (!this.#lightColor) this.#lightColor = this.colorAt(.9, space);
    const darkContrast = contrast(color, this.#darkColor, 'WCAG21');
    const lightContrast = contrast(color, this.#lightColor, 'WCAG21');

    return (darkContrast > lightContrast) ? this.#darkColor : this.#lightColor;
  }

  setName(name: string): void {
    this.name = name;
  }

  addColor(): void {
    this.#keyColors.push(this.#keyColors[this.#keyColors.length - 1].clone());
    this.#invalidate();
  }

  removeColor(index: number): void {
    if (this.#keyColors.length === 1 || index < 0 || index >= this.#keyColors.length) return;
    this.#keyColors.splice(index, 1);
    this.#invalidate();
  }

  updateColor(index: number, color: string) {
    this.#keyColors[index] = this.#newModel(color);
    this.#invalidate();
  }

  toJSON() {
    return {
      name: this.name,
      colors: this.#keyColors.map(c => c.toString()),
    };
  }

  #invalidate(): void {
    this.#range = undefined;
    this.#lightColor = undefined;
    this.#darkColor = undefined;
    this.#colorSpace = undefined;
  }

  #newModel(color: string): ColorModel {
    return new ColorModel(parse(color));
  }
}

export function toSrgb(color: ColorModel | ColorObject): string {
  const srgb = ColorSpace.get('srgb');
  const inGamut = (color instanceof ColorModel) ? color.inGamut(srgb) : toGamut(color, {space: srgb});
  const inSrgb = convert(inGamut, srgb);
  return serialize(inSrgb, { format: 'hex' });
}

export function getOutputLightness(color: ColorModel | ColorObject, space: ColorSpace) {
  const inGamut = (color instanceof ColorModel) ? color.inGamut(space) : toGamut(color, {space});
  return getCoord(inGamut, 'l');
}

function randomColor(): ColorObject {
  return {
    space: ColorSpace.get('srgb'),
    coords: [Math.random(), Math.random(), Math.random()],
  };
}

interface RampRange {
  (percentage: number): ColorObject;
}

function generateRampRange(keyColors: ColorObject[], targetSpace: ColorSpace): RampRange {
  const rampStops: ColorObject[] = keyColors.map(c => convert(c, targetSpace));

  // Sort by lightness.
  rampStops.sort((a, b) => a.coords[0] - b.coords[0]);

  // Add start and end stops.
  const [startL, startA, startB] = rampStops[0].coords;
  const [endL, endA, endB] = rampStops[rampStops.length - 1].coords;
  if (startL !== 0)
    rampStops.unshift({ space: targetSpace, coords: [0, startA, startB] });
  if (endL !== 1)
    rampStops.push({ space: targetSpace, coords: [1, endA, endB] });

  // Generate ranges.
  const ranges = rampStops.map((stop, i, stops) => {
    const aL = stop.coords[0];
    if (aL === 1) {
      return { start: 1, end: 1, range: () => stop };
    }
    const bL = stops[i + 1].coords[0];
    return {
      start: aL,
      end: bL,
      range: range(stop, stops[i + 1], { space: targetSpace }),
    };
  });

  return (percentage) => {
    const i = searchIndex(ranges, percentage, r => r.start);
    if (i == null) throw new Error('Could not find stop ' + percentage);
    const { start, end, range } = ranges[i];
    const scaled = (start !== end) ? ((percentage - start) / (end - start)) : 0;
    return range(scaled);
  };
}

export function generateLightnessGradient(colorSpace: ColorSpace, isInverted = false): string[] {
  const black = convert(parse('#000'), colorSpace);
  const white = convert(parse('#fff'), colorSpace);
  const start = isInverted ? white : black;
  const end = isInverted ? black : white;

  return steps(start, end, { outputSpace: ColorSpace.get('srgb'), maxDeltaE: 3 }).map(color => display(color));
}

function searchIndex<T, U>(array: T[], value: U, getter: (el: T) => U): number | undefined {
  let index = 0;
  while (index < array.length) {
    if (getter(array[index]) > value) break;
    index++;
  }
  return index > 0 ? (index - 1) : undefined;
}
