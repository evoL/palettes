import Color from 'colorjs.io';

export function buildRamp(keyColors: string[]): Color[] {
  const colors = keyColors.map(hex => new Color(hex).to('oklab'));

  // Sort by lightness.
  colors.sort((a, b) => a.coords[0] - b.coords[0]);

  // Add start and end stops.
  const [, startA, startB] = colors[0].coords;
  const [, endA, endB] = colors[colors.length - 1].coords;
  colors.unshift(new Color('oklab', [0, startA, startB]));
  colors.push(new Color('oklab', [1, endA, endB]));

  return colors;
}

function searchIndex<T, U>(array: T[], value: U, getter: (el: T) => U): number | undefined {
  let index = 0;
  while (index < array.length) {
    if (getter(array[index]) > value) break;
    index++;
  }
  return index > 0 ? (index - 1) : undefined;
}

const K1 = 0.206;
const K2 = 0.03;
const K3 = (1 + K1) / (1 + K2);

/**
 * Converts Oklabs "new lightness estimate" to the old one.
 * 
 * Source: https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
 */
function transformLightness(lightness: number) {
  return (lightness * (lightness + K1)) / (K3 * (lightness + K2));
}

export function getStops(colorRange: Color[], lightnesses: number[], useNewLightness = true): Array<{ color: string, labelColor: string }> {
  return lightnesses.map(lightness => {
    const l = useNewLightness ? transformLightness(lightness / 100) : (lightness / 100);

    const i = searchIndex(colorRange, l, c => c.coords[0]);
    if (i == null) {
      throw new Error('Did not find stop');
    }
    let color: Color;
    if (i === colorRange.length - 1) {
      color = colorRange[colorRange.length - 1];
    } else {
      const min = colorRange[i].coords[0];
      const max = colorRange[i + 1].coords[0];
      const ratio = (l - min) / (max - min);
      const range = colorRange[i].range(colorRange[i + 1])
      color = range(ratio);
    }

    color = color.to('srgb');

    const labelDark = new Color('oklab', [10, color.coords[1], color.coords[2]]).to('srgb');
    const labelLight = new Color('oklab', [90, color.coords[1], color.coords[2]]).to('srgb');
    const labelColor = (color.contrast(labelDark, 'WCAG21') > color.contrast(labelLight, 'WCAG21')) ? labelDark : labelLight;

    return {
      color: color.toString({ format: 'hex' }),
      labelColor: labelColor.display(),
    };
  });
}

export function displayGradient(range: Color[]): string {
  const gradient: Color[] = [];

  for (let i = 1; i < range.length; i++) {
    const left = range[i - 1];
    const right = range[i];
    gradient.push(...left.steps(right, { maxDeltaE: 3, outputSpace: 'srgb' }).slice(0, -1));
  }
  gradient.push(range[range.length - 1].to('srgb'));

  const colors = gradient.map(color => color.display());

  return `linear-gradient(to right, ${colors.join(', ')})`;
}
