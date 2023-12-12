export enum StopType {
  BEZIER = 'bezier',
  MANUAL = 'manual',
}

export interface BezierStops {
  type: StopType.BEZIER;
  numStops: number;
  curve: Curve;
  skipExtremes?: boolean;
}

export interface ManualStops {
  type: StopType.MANUAL;
  values: number[];
}

export type Stops = BezierStops | ManualStops;

export interface Point {
  x: number;
  y: number;
}

export type Curve = [Point, Point, Point, Point];

export interface ColorSpec {
   name: string;
   colors: string[];
}

export enum ColorSpaceType {
  OKLAB = 'oklab',
  OKLAB_LR = 'oklab_lr',
}
