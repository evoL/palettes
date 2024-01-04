import { sortBy } from "lodash-es";
import type { Curve } from "./types";
import type { Subscriber, Unsubscriber } from "svelte/store";

export interface Preset<T> {
  id: string;
  name: string;
  content: T;
}

export type Presets<T> = Record<string, Preset<T>>;

export function getPresetList<T>(presets: Presets<T>): Array<Preset<T>> {
  return sortBy(Object.values(presets), (preset) => preset.name);
}

class PresetStorage<T> {
  #presets: Presets<T> = {};
  #subscriptions: Array<Subscriber<Presets<T>>> = [];
  #key: string;

  constructor(key: string) {
    this.#key = key;
    const contents = localStorage.getItem(key);
    if (contents != null) {
      try {
        this.#presets = JSON.parse(contents);
      } catch (e: unknown) {
        // welp.
      }
    }
  }

  subscribe(notify: Subscriber<Presets<T>>): Unsubscriber {
    notify(this.#presets);

    this.#subscriptions.push(notify);
    return () => {
      const index = this.#subscriptions.indexOf(notify);
      if (index < 0) return;   // wtf
      this.#subscriptions.splice(index, 1);
    };
  }

  set(presets: Presets<T>): void {
    this.#presets = presets;
    for (const notify of this.#subscriptions) {
      notify(presets);
    }

    localStorage.setItem(this.#key, JSON.stringify(presets));
  }

  add(preset: Preset<T>): void {
    this.set({ ...this.#presets, [preset.id]: preset });
  }

  update(id: string, fn: (value: Preset<T>) => Preset<T>): void {
    const preset = this.#presets[id];
    if (!preset) return;
    this.set({ ...this.#presets, [id]: fn(preset) });
  }

  delete(id: string) {
    if (!this.#presets[id]) return;
    const presets = { ...this.#presets };
    delete presets[id];
    this.set(presets);
  }
}

////////////////////////////////

export const CURVES: Presets<Curve> = {
  'default': {
    id: 'default',
    name: 'Default',
    content: [
      { x: 0, y: 0 },
      {
        x: 0.41225165562913907,
        y: 0.16428571428571426
      },
      {
        x: 0.6473509933774835,
        y: 0.8928571428571429
      },
      { x: 1, y: 1 }
    ],
  }
}

export const CURVE_LIST = getPresetList(CURVES);

export const USER_CURVES = new PresetStorage<Curve>('evolved_palettes:curves');

export function findCurvePreset(curve: Curve, ...lists: ReadonlyArray<Array<Preset<Curve>>>): Preset<Curve> | undefined {
  for (const list of lists) {
    const preset = list.find(preset => 
      preset.content.every((point, i) => 
        practicallyEquals(point.x, curve[i].x) && practicallyEquals(point.y, curve[i].y)));
    if (preset) return preset;
  }
  return undefined;
}

function practicallyEquals(a: number, b: number): boolean {
  return Math.abs(a - b) <= .000001;
}
