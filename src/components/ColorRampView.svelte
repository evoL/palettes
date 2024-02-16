<script lang="ts">
  import { ColorSpace } from "colorjs.io/fn";
  import { toSrgb, type ColorRamp, getOutputLightness } from "../lib/colors";
  import ColorShade from "./ColorShade.svelte";

  export let ramp: ColorRamp;
  export let colorSpace: ColorSpace;
  export let stops: number[] = [];
  export let stopNames: string[] = [];

  const srgb = ColorSpace.get('srgb');
</script>

<div class="ramp">
  {#each stops as val, i}
    {@const color = ramp.colorAt(val, colorSpace)}
    <div class="ramp__shade">
      <ColorShade
        color={toSrgb(color)}
        textColor={toSrgb(ramp.contrastColorAt(val, colorSpace))}
        name={stopNames[i]}
        value={getOutputLightness(color, srgb)}
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
