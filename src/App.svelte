<script lang="ts">
  import BezierEasing from "bezier-easing";
  import { ColorSpace } from "colorjs.io/fn";

  import BezierStopsEditor from "./components/BezierStopsEditor.svelte";
  import ColorRampEditor from "./components/ColorRampEditor.svelte";
  import ColorRampView from "./components/ColorRampView.svelte";
  import ExportButton from "./components/ExportButton.svelte";
  import SettingsEditor from "./components/SettingsEditor.svelte";
  import SettingsPreview from "./components/SettingsPreview.svelte";
  import ManualStopsEditor from "./components/ManualStopsEditor.svelte";
  import { StopType, type PersistedProjects } from "./lib/types";
  import { ColorRamp } from "./lib/colors";
  import { CURVES } from "./lib/presets";
  import { nameStops } from "./lib/stop_names";
  import { onDestroy, onMount } from "svelte";
  import { projectStore, store, updateProject } from "./lib/model";
  import {
    fromPersisted,
    loadProjects,
    saveProjects,
    toPersisted,
  } from "./lib/storage";
  import { type Unsubscriber } from "svelte/store";

  let isEditing = false;
  let initialFetchDone = false;
  let unsubscribePersistence: Unsubscriber;

  let actualStops: number[];
  let stopNames: string[];
  let colorSpace: ColorSpace;

  // Storage

  onMount(() => {
    const persisted = loadProjects();
    if (persisted != null) {
      store.set({
        projects: persisted.projects.map(fromPersisted),
        activeIndex: persisted.activeIndex,
      });
    }

    // Initialize color ramps — they are empty by default.
    if (!$projectStore.colorRamps.length) {
      addRamp();
    }

    unsubscribePersistence = store.subscribe((state) => {
      if (!initialFetchDone) return;

      const persisted: PersistedProjects = {
        projects: state.projects.map(toPersisted),
        activeIndex: state.activeIndex,
      };
      saveProjects(persisted);
    });

    initialFetchDone = true;
  });

  onDestroy(() => {
    if (unsubscribePersistence) unsubscribePersistence();
  });

  // Derived state

  $: colorSpace = ColorSpace.get($projectStore.colorSpaceType);
  $: {
    switch ($projectStore.stops.type) {
      case StopType.BEZIER: {
        const { curve, skipExtremes } = $projectStore.stops;
        const numStops = $projectStore.stops.numStops + (skipExtremes ? 2 : 0);
        const easing = BezierEasing(
          curve[1].x,
          curve[1].y,
          curve[2].x,
          curve[2].y,
        );
        const applyCurve = (i: number) => easing(i / (numStops - 1));
        const mapFn = $projectStore.isInverted
          ? (i: number) => 1 - applyCurve(i)
          : applyCurve;
        actualStops = Array.from({ length: numStops }).map((_, i) => mapFn(i));
        if (skipExtremes) {
          actualStops = actualStops.slice(1, -1);
        }
        break;
      }
      case StopType.MANUAL:
        actualStops = $projectStore.stops.values;
        break;
    }
  }
  $: stopNames = nameStops(actualStops, $projectStore.isInverted);

  // Functions

  function changeStopType(type: StopType) {
    if ($projectStore.stops.type === type) return;

    switch (type) {
      case StopType.BEZIER:
        updateProject({
          stops: {
            type,
            numStops: getNumStops(),
            curve: CURVES["default"].content,
          },
        });
        break;
      case StopType.MANUAL:
        updateProject({
          stops: {
            type,
            values: [...actualStops],
          },
        });
        break;
    }
  }

  function getNumStops() {
    switch ($projectStore.stops.type) {
      case StopType.BEZIER:
        return $projectStore.stops.numStops;
      case StopType.MANUAL:
        return $projectStore.stops.values.length;
    }
  }

  function addRamp() {
    updateProject({
      colorRamps: [...$projectStore.colorRamps, new ColorRamp()],
    });
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
          stopType={$projectStore.stops.type}
          colorSpaceType={$projectStore.colorSpaceType}
          isInverted={$projectStore.isInverted}
          on:stopTypeChange={(e) => changeStopType(e.detail)}
          on:colorSpaceTypeChange={(e) =>
            updateProject({ colorSpaceType: e.detail })}
          on:isInvertedChange={(e) => updateProject({ isInverted: e.detail })}
        />
      {:else}
        <SettingsPreview
          stopType={$projectStore.stops.type}
          colorSpaceType={$projectStore.colorSpaceType}
          isInverted={$projectStore.isInverted}
        />
      {/if}

      <div class="export-button">
        <ExportButton
          ramps={$projectStore.colorRamps}
          stops={actualStops}
          {stopNames}
          {colorSpace}
        />
      </div>
    </div>
  </header>
  {#if isEditing}
    <div class="stop-editor">
      {#if $projectStore.stops.type === StopType.BEZIER}
        <BezierStopsEditor
          stops={$projectStore.stops}
          {colorSpace}
          isInverted={$projectStore.isInverted}
          on:update={(e) => updateProject({ stops: e.detail })}
        />
      {:else if $projectStore.stops.type === StopType.MANUAL}
        <ManualStopsEditor
          stops={$projectStore.stops}
          on:update={(e) => updateProject({ stops: e.detail })}
        />
      {/if}
    </div>
  {/if}

  {#each $projectStore.colorRamps as ramp, i}
    <div class="color-editor">
      <ColorRampEditor
        name={ramp.name}
        keyColors={ramp.keyColors}
        on:updateName={(e) => {
          ramp.name = e.detail;
          updateProject();
        }}
        on:addColor={() => {
          ramp.addColor();
          updateProject();
        }}
        on:updateColor={(e) => {
          const { index, color } = e.detail;
          ramp.updateColor(index, color);
          updateProject();
        }}
        on:removeColor={(e) => {
          ramp.removeColor(e.detail);
          updateProject();
        }}
        on:remove={() => {
          if ($projectStore.colorRamps.length > 1) {
            updateProject({
              colorRamps: $projectStore.colorRamps.filter((_, j) => j !== i),
            });
          }
        }}
      />
    </div>

    <div class="ramp-view">
      <ColorRampView {ramp} {colorSpace} {stopNames} stops={actualStops} />
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

  .export-button {
    margin-top: var(--sl-spacing-small);
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
