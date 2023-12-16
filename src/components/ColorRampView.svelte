<script lang="ts">
  import type { ColorSpace } from "colorjs.io/fn";
  import { toSrgb, type ColorRamp } from "../lib/colors";
  import ColorShade from "./ColorShade.svelte";
  import { nameStops } from "../lib/stop_names";

  export let ramp: ColorRamp;
  export let colorSpace: ColorSpace;
  export let stops: number[] = [];

  $: stopNames = nameStops(stops);
</script>

<div class="ramp">
  {#each stops as val, i}
    <div class="ramp__shade">
      <ColorShade
        color={toSrgb(ramp.colorAt(val, colorSpace))}
        textColor={toSrgb(ramp.contrastColorAt(val, colorSpace))}
        value={stopNames[i]}
      />
    </div>
  {/each}
</div>

<style>
  .ramp {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sl-spacing-x-small) 0;
    height: 100%;
    width: 100%;
  }

  .ramp__shade {
    flex: 1;
    min-height: 6em;
    min-width: 2.5em;
  }
</style>
