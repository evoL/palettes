<script lang="ts">
  import type { ColorSpace } from "colorjs.io/fn";
  import { type ColorRamp, toSrgb } from "../lib/colors";
  import { getHuetoneUrl, type HuetoneJson } from "../lib/huetone";

  export let ramps: ColorRamp[];
  export let colorSpace: ColorSpace;
  export let stops: number[] = [];
  export let stopNames: string[] = [];

  function getHuetoneJson(): HuetoneJson {
    return {
      name: "evolved palette",
      hues: ramps.map((ramp) => ({
        name: ramp.name,
        colors: stops.map((stop) => toSrgb(ramp.colorAt(stop, colorSpace))),
      })),
      tones: stopNames,
    };
  }

  function handleMenuItem(value: string) {
    const huetoneJson = getHuetoneJson();

    switch (value) {
    case 'copyJson':
      navigator.clipboard.writeText(JSON.stringify(huetoneJson));
      break;
    case 'huetone':
      window.open(getHuetoneUrl(huetoneJson), '_blank');
      break;
    }
  }
</script>

<sl-dropdown on:sl-select={(e) => handleMenuItem(e.detail.item.value)}>
  <sl-button slot="trigger" caret size="small">
    <sl-icon slot="prefix" name="box-arrow-up-right" />
    Export
  </sl-button>
  <sl-menu>
    <sl-menu-item value="copyJson">
      <sl-icon slot="prefix" name="copy" />
      Copy as JSON
    </sl-menu-item>
    <sl-menu-item value="huetone">
      <sl-icon slot="prefix" name="h-square" />
      Open in Huetone
    </sl-menu-item>
  </sl-menu>
</sl-dropdown>

<style>
  sl-dropdown,
  sl-button {
    width: 100%;
  }
</style>
