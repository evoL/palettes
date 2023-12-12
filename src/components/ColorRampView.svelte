<script lang="ts">
    import type { ColorSpace } from "colorjs.io/fn";
  import { toSrgb, type ColorRamp } from "../lib/colors";

  export let ramp: ColorRamp;
  export let colorSpace: ColorSpace;
  export let stops: number[] = [];
</script>

<div class="ramp">
  {#each stops as val}
    <div
      class="shade"
      style:--color={toSrgb(ramp.colorAt(val, colorSpace))}
      style:--text-color={toSrgb(ramp.contrastColorAt(val, colorSpace))}
    >
      <span>{toSrgb(ramp.colorAt(val, colorSpace))}</span>
    </div>
  {/each}
</div>

<style>
  .ramp {
    display: flex;
  }

  .shade {
    background: var(--color);
    color: var(--text-color);
    flex: 1;
    position: relative;
  }

  .shade span {
    align-items: center;
    background-color: inherit;
    bottom: 0;
    box-sizing: border-box;
    display: flex;
    font-family: var(--sl-font-mono);
    font-size: var(--sl-font-size-small);
    justify-content: center;
    left: 50%;
    padding: var(--sl-spacing-medium);
    pointer-events: none;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: 1;
  }

  .shade:not(:hover) span {
    display: none;
  }
</style>
