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

  let stops: Stops = {
    type: StopType.BEZIER,
    numStops: 13,
    curve: [
      { x: 0, y: 0 },
      { x: 0.25, y: 0 },
      { x: 0.6, y: 1 },
      { x: 1, y: 1 },
    ],
  };
  let colorRamps: ColorRamp[] = [new ColorRamp()];
  let colorSpaceType: ColorSpaceType = ColorSpaceType.OKLAB;
  let isEditing = false;

  let actualStops: number[];
  let colorSpace: ColorSpace;

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
        actualStops = Array.from({ length: numStops }).map((_, i) =>
          easing(i / (numStops - 1))
        );
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

  function changeStopType(type: StopType) {
    if (stops.type === type) return;

    switch (type) {
      case StopType.BEZIER:
        stops = {
          type,
          numStops: getNumStops(),
          curve: [
            { x: 0, y: 0 },
            { x: 0.25, y: 0 },
            { x: 0.6, y: 1 },
            { x: 1, y: 1 },
          ],
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

  function updateNumStops(numStops: number) {
    switch (stops.type) {
      case StopType.BEZIER:
        stops.numStops = numStops;
        break;
      case StopType.MANUAL:
        stops.values.length = numStops;
        break;
    }
  }

  function updateBezierCurve(curve: Curve) {
    if (stops.type !== "bezier") throw new Error("Need Bezier stops");
    stops.curve = curve;
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
      <sl-icon-button
        name="gear"
        label="Edit settings"
        on:click={() => (isEditing = true)}
      />
    {/if}

    <div class="settings">
      {#if isEditing}
        <SettingsEditor
          stopType={stops.type}
          colorSpaceType={colorSpaceType}
          on:stopTypeChange={(e) => changeStopType(e.detail)}
          on:colorSpaceTypeChange={(e) => colorSpaceType = e.detail}
        />
      {:else}
        <SettingsPreview stopType={stops.type} {colorSpaceType} />
      {/if}
    </div>
  </header>
  {#if isEditing}
    <div class="editor">
      {#if stops.type === StopType.BEZIER}
        <BezierStopsEditor
          {stops}
          {colorSpace}
          on:update={(e) => (stops = e.detail)}
        />
      {:else if stops.type === StopType.MANUAL}
        <ManualStopsEditor {stops} on:update={(e) => (stops = e.detail)} />
      {/if}
    </div>
  {/if}
  <div class="stops">
    {#each actualStops as val}
      <div class="name">
        {Math.round(val * 10000) / 100}
      </div>
    {/each}
  </div>

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

    <ColorRampView {ramp} {colorSpace} stops={actualStops} />
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
    width: 800px; /* TODO: make it more responsive */
  }

  header {
    display: grid;
    grid-row: 1/3;
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

  .editor {
    overflow: auto;
  }

  .stops {
    display: flex;
    align-self: end;
    grid-row: 2;
  }

  .stops .name {
    color: var(--sl-color-neutral-500);
    font-family: var(--sl-font-mono);
    font-size: var(--sl-font-size-2x-small);
    flex: 1;
    text-align: center;
  }

  .color-editor {
    grid-column: 1;
    padding: var(--sl-spacing-medium) 0;
  }
</style>
