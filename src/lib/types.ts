import type { ColorRamp } from "./colors";

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

export interface ColorRampDef {
  name: string;
  colors: string[];
}

export interface Project {
  name: string;
  stops: Stops;
  colorRamps: ColorRamp[];
  colorSpaceType: ColorSpaceType;
  isInverted: boolean;
}

export interface PersistedProject {
  name?: string;  // Will be set to "Untitled Project" if not set.
  stops: Stops;
  colorRamps: ColorRampDef[];
  colorSpaceType: ColorSpaceType;
  isInverted: boolean;
}

export interface PersistedProjects {
  projects: PersistedProject[];
  activeIndex?: number;
}
