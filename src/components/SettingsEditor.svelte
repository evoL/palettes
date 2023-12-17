<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { COLOR_SPACE_TYPES, LIGHT_OR_DARK, STOP_TYPES } from "../lib/display_names";
  import { ColorSpaceType, StopType } from "../lib/types";

  const dispatch = createEventDispatcher<{
    stopTypeChange: StopType;
    colorSpaceTypeChange: ColorSpaceType;
    isInvertedChange: boolean;
  }>();

  export let stopType: StopType;
  export let colorSpaceType: ColorSpaceType;
  export let isInverted: boolean;
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

<sl-select
  class="control"
  label="Order"
  size="small"
  value={String(isInverted)}
  on:sl-change={(e) => dispatch("isInvertedChange", e.target.value === 'true')}
>
  <sl-option value="false">{LIGHT_OR_DARK[0]}</sl-option>
  <sl-option value="true">{LIGHT_OR_DARK[1]}</sl-option>
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
