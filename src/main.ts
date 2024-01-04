import './app.css';

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/tag/tag.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import App from './App.svelte'
import { ColorSpace, OKLab, LCH, P3, sRGB, Lab } from 'colorjs.io/fn';

const baseUrl = new URL(document.baseURI);
setBasePath(baseUrl.pathname);

ColorSpace.register(Lab);
ColorSpace.register(LCH);
ColorSpace.register(OKLab);
ColorSpace.register(P3);
ColorSpace.register(sRGB);


// https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
const k1 = 0.206;
const k2 = 0.03;
const k3 = (1 + k1) / (1 + k2);
ColorSpace.register(new ColorSpace({
  id: 'oklab_lr',
  name: 'Oklab Lr',
  base: OKLab,
  fromBase(oklab) {
    const l = oklab[0];
    const k3l = k3 * l;
    const k3lMk1 = k3l - k1;
    const lr = (k3lMk1 + Math.sqrt(k3lMk1 * k3lMk1 + 4 * k2 * k3l)) / 2;

    return [lr, oklab[1], oklab[2]];
  },
  toBase(oklabLr) {
    const lr = oklabLr[0];
    const l = lr * (lr + k1) / (k3 * (lr + k2));

    return [l, oklabLr[1], oklabLr[2]];
  },
}));

const app = new App({
  target: document.getElementById('app'),
})

export default app
