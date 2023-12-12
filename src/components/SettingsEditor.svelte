<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { COLOR_SPACE_TYPES, STOP_TYPES } from "../lib/display_names";
  import { ColorSpaceType, StopType } from "../lib/types";

  const dispatch = createEventDispatcher<{
    stopTypeChange: StopType;
    colorSpaceTypeChange: ColorSpaceType;
  }>();

  export let stopType: StopType;
  export let colorSpaceType: ColorSpaceType;
</script>

<sl-select
  class="control"
  label="Stops"
  size="small"
  value={stopType}
  on:sl-change={(e) => dispatch("stopTypeChange", e.target.value)}
>
  {#each Object.values(StopType) as type}
    <sl-option value={type}>{STOP_TYPES[type]}</sl-option>
  {/each}
</sl-select>

<sl-select
  class="control"
  label="Color space"
  size="small"
  value={colorSpaceType}
  on:sl-change={(e) => dispatch("colorSpaceTypeChange", e.target.value)}
>
  {#each Object.values(ColorSpaceType) as type}
    <sl-option value={type}>{COLOR_SPACE_TYPES[type]}</sl-option>
  {/each}
</sl-select>

<style>
  .control {
    margin-bottom: var(--sl-spacing-2x-small);
  }

  .control::part(form-control) {
    align-items: center;
    display: grid;
    grid: auto / min-content 1fr;
    gap: var(--sl-spacing-small);
  }

  .control::part(form-control-label) {
    white-space: nowrap;
  }
</style>
