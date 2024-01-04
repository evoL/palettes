<script lang="ts">
  import BezierEasing from "bezier-easing";
  import { ColorSpace } from "colorjs.io/fn";

  import BezierStopsEditor from "./components/BezierStopsEditor.svelte";
  import ColorRampEditor from "./components/ColorRampEditor.svelte";
  import ColorRampView from "./components/ColorRampView.svelte";
  import SettingsEditor from "./components/SettingsEditor.svelte";
  import SettingsPreview from "./components/SettingsPreview.svelte";
  import ManualStopsEditor from "./components/ManualStopsEditor.svelte";
  import {
    StopType,
    type Curve,
    type Stops,
    ColorSpaceType,
  } from "./lib/types";
  import { ColorRamp } from "./lib/colors";
  import { CURVES } from "./lib/presets";
  import { afterUpdate, onMount } from "svelte";

  const STORAGE_KEY = "evolved_palettes";

  let stops: Stops = {
    type: StopType.BEZIER,
    numStops: 13,
    curve: CURVES["default"].content,
  };
  let colorRamps: ColorRamp[] = [new ColorRamp()];
  let colorSpaceType: ColorSpaceType = ColorSpaceType.OKLAB;
  let isInverted = false;
  let isEditing = false;
  let initialFetchDone = false;

  let actualStops: number[];
  let colorSpace: ColorSpace;

  // Derived state

  $: colorSpace = ColorSpace.get(colorSpaceType);
  $: {
    switch (stops.type) {
      case StopType.BEZIER: {
        const { curve, skipExtremes } = stops;
        const numStops = stops.numStops + (skipExtremes ? 2 : 0);
        const easing = BezierEasing(
          curve[1].x,
          curve[1].y,
          curve[2].x,
          curve[2].y
        );
        const applyCurve = (i: number) => easing(i / (numStops - 1));
        const mapFn = isInverted
          ? (i: number) => 1 - applyCurve(i)
          : applyCurve;
        actualStops = Array.from({ length: numStops }).map((_, i) => mapFn(i));
        if (skipExtremes) {
          actualStops = actualStops.slice(1, -1);
        }
        break;
      }
      case StopType.MANUAL:
        actualStops = stops.values;
        break;
    }
  }

  // Storage

  onMount(() => {
    const content = localStorage.getItem(STORAGE_KEY);
    if (content != null) {
      try {
        const serialized = JSON.parse(content);

        stops = serialized.stops;
        colorRamps = serialized.colorRamps.map(
          ({ name, colors }) => new ColorRamp(colors, name)
        );
        colorSpaceType = serialized.colorSpaceType;
        isInverted = serialized.isInverted;
      } catch (e: unknown) {
        // welp
      }
    }

    initialFetchDone = true;
  });

  $: {
    if (initialFetchDone) {
      const serialized = {
        stops,
        colorRamps,
        colorSpaceType,
        isInverted,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    }
  }

  // Functions

  function changeStopType(type: StopType) {
    if (stops.type === type) return;

    switch (type) {
      case StopType.BEZIER:
        stops = {
          type,
          numStops: getNumStops(),
          curve: CURVES["default"].content,
        };
        break;
      case StopType.MANUAL:
        stops = {
          type,
          values: [...actualStops],
        };
        break;
    }
  }

  function getNumStops() {
    switch (stops.type) {
      case StopType.BEZIER:
        return stops.numStops;
      case StopType.MANUAL:
        return stops.values.length;
    }
  }

  function addRamp() {
    colorRamps.push(new ColorRamp());
    colorRamps = colorRamps;
  }
</script>

<main>
  <header>
    <h1>evolved palettes</h1>
    {#if isEditing}
      <sl-icon-button
        name="x-circle"
        label="Close settings"
        on:click={() => (isEditing = false)}
      />
    {:else}
      <sl-tooltip content="Edit settings">
        <sl-icon-button
          name="gear"
          label="Edit settings"
          on:click={() => (isEditing = true)}
        />
      </sl-tooltip>
    {/if}

    <div class="settings">
      {#if isEditing}
        <SettingsEditor
          stopType={stops.type}
          {colorSpaceType}
          {isInverted}
          on:stopTypeChange={(e) => changeStopType(e.detail)}
          on:colorSpaceTypeChange={(e) => (colorSpaceType = e.detail)}
          on:isInvertedChange={(e) => (isInverted = e.detail)}
        />
      {:else}
        <SettingsPreview stopType={stops.type} {colorSpaceType} {isInverted} />
      {/if}
    </div>
  </header>
  {#if isEditing}
    <div class="stop-editor">
      {#if stops.type === StopType.BEZIER}
        <BezierStopsEditor
          {stops}
          {colorSpace}
          {isInverted}
          on:update={(e) => (stops = e.detail)}
        />
      {:else if stops.type === StopType.MANUAL}
        <ManualStopsEditor {stops} on:update={(e) => (stops = e.detail)} />
      {/if}
    </div>
  {/if}

  {#each colorRamps as ramp, i}
    <div class="color-editor">
      <ColorRampEditor
        name={ramp.name}
        keyColors={ramp.keyColors}
        on:updateName={(e) => {
          ramp.name = e.detail;
          colorRamps = colorRamps;
        }}
        on:addColor={() => {
          ramp.addColor();
          colorRamps = colorRamps;
        }}
        on:updateColor={(e) => {
          const { index, color } = e.detail;
          ramp.updateColor(index, color);
          colorRamps = colorRamps;
        }}
        on:removeColor={(e) => {
          ramp.removeColor(e.detail);
          colorRamps = colorRamps;
        }}
        on:remove={() => {
          if (colorRamps.length > 1) {
            colorRamps.splice(i, 1);
            colorRamps = colorRamps;
          }
        }}
      />
    </div>

    <div class="ramp-view">
      <ColorRampView {ramp} {colorSpace} {isInverted} stops={actualStops} />
    </div>
  {/each}

  <sl-button
    class="add-button"
    size="small"
    on:click={() => {
      addRamp();
    }}
  >
    <sl-icon slot="prefix" name="plus-lg" />
    Add
  </sl-button>
</main>

<style>
  main {
    display: grid;
    gap: var(--sl-spacing-small) var(--sl-spacing-small);
    grid-template-columns: 200px 1fr;
    margin: 0 auto;
    max-width: 1280px;
    padding: 0 var(--sl-spacing-medium);
  }

  header {
    display: grid;
    grid-template-columns: 1fr min-content;
    grid-template-rows: min-content;
    font-size: var(--sl-font-size-small);
  }
  header h1 {
    align-self: center;
    font-size: inherit;
    line-height: 1;
  }

  .settings {
    grid-column: 1 / 3;
    margin-top: var(--sl-spacing-2x-small);
  }

  .stop-editor {
    overflow: auto;
  }

  .color-editor {
    grid-column: 1;
    padding: var(--sl-spacing-medium) 0;
  }

  @media (max-width: 720px) {
    main {
      display: flex;
      flex-direction: column;
    }

    .add-button {
      margin-top: var(--sl-spacing-medium);
    }
  }
</style>
