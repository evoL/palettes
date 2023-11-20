import { derived, type Readable, type Stores, type StoresValues, type Writable } from "svelte/store";

const NO_VALUE = Symbol('NO_VALUE');

export function select<S extends Stores, T>(stores: S, get: (values: StoresValues<S>) => T): Readable<T> {
  let value: T|typeof NO_VALUE = NO_VALUE;
  return derived(stores, (values, set) => {
    const nextValue: T = get(values);
    if (value === nextValue) return;
    set(nextValue);
    value = nextValue;
  });
}
