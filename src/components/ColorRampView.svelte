<script lang="ts">
  import type { ColorSpace } from "colorjs.io/fn";
  import { toSrgb, type ColorRamp } from "../lib/colors";
  import ColorShade from "./ColorShade.svelte";

  export let ramp: ColorRamp;
  export let colorSpace: ColorSpace;
  export let stops: number[] = [];
</script>

<div class="ramp">
  {#each stops as val}
    <div class="ramp__shade">
      <ColorShade
        color={toSrgb(ramp.colorAt(val, colorSpace))}
        textColor={toSrgb(ramp.contrastColorAt(val, colorSpace))}
      />
    </div>
  {/each}
</div>

<style>
  .ramp {
    display: flex;
  }

  .ramp__shade {
    flex: 1;
  }
</style>
