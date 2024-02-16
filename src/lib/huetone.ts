import { compressToEncodedURIComponent } from "lz-string";

export interface HuetoneJson {
  name: string;
  hues: HuetoneHue[];
  tones: string[];
}

interface HuetoneHue {
  name: string;
  colors: string[];
}

const HUETONE_BASE_URL = 'https://huetone.ardov.me/';

export function getHuetoneUrl(json: HuetoneJson): URL {
  const url = new URL(HUETONE_BASE_URL);
  url.searchParams.set('palette', compressToEncodedURIComponent(JSON.stringify(json)));
  return url;
}
