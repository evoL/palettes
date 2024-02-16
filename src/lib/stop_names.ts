type NamingMethod = 'light_to_dark' | 'dark_to_light';

/** 
 * The values we want the resulting names to be multiplies of.
 * Must be sorted from largest to smallest.
 */
const MULTIPLIERS = [100, 50, 10];
/**
 * The maximum name that we can assign. This will be either black or white.
 */
const MAX_NAME = 1000;

// We don't want too granular values for the names, so we allow for values within a
// threshold to be considered.
// Through experimentation, it looks like adjusting the threshold like below works
// the best. Percentages didn't do the trick.
const getStopThreshold = (multiplier: number) => Math.sqrt(multiplier) * 3;

export function nameStops(lightness: number[], isInverted = false): string[] {
  // Copy the input to remove already named values.
  const input = [...lightness];

  const mapValue = isInverted ? (val: number) => 1 - val : (val: number) => val;

  // Maps the assigned name to the input value and the difference to the scaled value
  // without rounding. We'll use that to:
  // 1. check if there is a value associated with a name already,
  // 2. if we have a conficting name, check if the newer one fits more closely.
  // The index will be useful to restore the initial ordering.
  const namedStops = new Map<number, { diff: number, value: number, inputIndex: number }>();

  for (const multiplier of MULTIPLIERS) {
    const threshold = getStopThreshold(multiplier);

    let inputIndex = 0;
    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      const scaledValue = mapValue(value) * MAX_NAME;
      const name = Math.round(scaledValue / multiplier) * multiplier;
      inputIndex = lightness.indexOf(value, inputIndex);

      const diff = Math.abs(scaledValue - name);
      if (diff > threshold) continue;
 
      if (namedStops.has(name)) {
        const oldEntry = namedStops.get(name);
        if (diff < oldEntry.diff) {
          // The new value matches more closely than the old one, swap them.
          namedStops.set(name, { value, diff, inputIndex });
          input.splice(i, 1, oldEntry.value);
        }
      } else {
        // There is no name yet, insert.
        namedStops.set(name, { value, diff, inputIndex });
        input.splice(i, 1);
        i--;
      }
    }
  }

  // We ran out of multipliers and there might be still values to match.
  // Since we have nothing better, just round all the values and add results.
  let inputIndex = 0;
  for (const value of input) {
    inputIndex = lightness.indexOf(value, inputIndex);
    namedStops.set(Math.round(mapValue(value) * MAX_NAME), { value, diff: 0, inputIndex });
  }

  // The map has lost the initial ordering. Recover it using the input array.
  return [...namedStops.entries()]
    .sort(([, a], [, b]) => a.inputIndex - b.inputIndex)
    .map(([name]) => `${name}`);
}
