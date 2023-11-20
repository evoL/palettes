<script context="module" lang="ts">
  import { writable } from "svelte/store";

  interface PaletteDef {
    name: string;
    keyColors: string[];
  }

  interface State {
    defs: PaletteDef[];
    tones: number[];
    useNewLightness?: boolean;
  }

  const STORAGE_KEY = "palette_generator_state";
  const persisted = localStorage.getItem(STORAGE_KEY);
  const state = writable<State>(
    persisted != null
      ? JSON.parse(persisted)
      : {
          defs: [{ name: "Sunglo", keyColors: ["#c75950"] }],
          tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
          useNewLightness: true,
        }
  );

  state.subscribe((s) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  });
</script>

<script lang="ts">
  import { derived } from "svelte/store";
  import PaletteEditor from "./lib/PaletteEditor.svelte";
  import { buildStops, displayGradient, getStops } from "./lib/generator";
  import RemoveButton from "./lib/RemoveButton.svelte";

  const palettes = derived(
    state,
    ({ defs, tones, useNewLightness }) =>
      new Map(
        defs.map((d) => {
          const range = buildStops(d.keyColors);
          const gradient = displayGradient(range);
          const stops = getStops(range, tones, useNewLightness);
          return [d.name, { range, gradient, stops }];
        })
      )
  );

  const huetoneJson = derived([palettes, state], ([map, { tones }]) => {
    return JSON.stringify(
      {
        name: "tonal palette",
        hues: [...map.entries()].map(([name, palette]) => ({
          name,
          colors: palette.stops.map((s) => s.color),
        })),
        tones: tones.map((t) => `${t}`),
      },
      undefined,
      2
    );
  });

  function addPalette() {
    state.update((s) => {
      s.defs.push({
        name: `Palette ${s.defs.length + 1}`,
        keyColors: ["#abcdef"],
      });
      return s;
    });
  }

  function renamePalette(index: number, name: string): void {
    state.update((s) => {
      s.defs[index].name = name;
      return s;
    });
  }

  function updatePalette(index: number, colors: string[]): void {
    state.update((s) => {
      s.defs[index].keyColors = colors;
      return s;
    });
  }

  function removePalette(index: number) {
    state.update((s) => ({ ...s, defs: s.defs.filter((_, i) => i !== index) }));
  }

  function addStop(stop: number, index: number) {
    state.update((s) => {
      s.tones.splice(index, 0, stop);
      return s;
    });
  }

  function removeStop(index: number) {
    state.update((s) => ({...s, tones: s.tones.filter((_, i) => i !== index)}));
  }

  function restrictStopInput(event: InputEvent) {
    if (event.data && !/^\d$/.test(event.data)) {
      event.preventDefault();
    }
  }

  function validateAndUpdateStop(input: HTMLInputElement, index: number) {
    let value = Number(input.value);
    if (value < 0) {
      value = 0;
      input.value = "0";
    } else if (value > 100) {
      value = 100;
      input.value = "100";
    }

    if ($state.tones[index] === value) return;

    state.update((s) => {
      s.tones[index] = value;
      return s;
    });
  }

  function handleStopKey(event: KeyboardEvent, index: number) {
    if (event.key !== "Enter") return;
    validateAndUpdateStop(event.currentTarget as HTMLInputElement, index);
  }
</script>

<main>
  <div class="settings">
    <label>
      <input type="checkbox" bind:checked={$state.useNewLightness}>
      Use new lightness estimate
    </label>
  </div>
  <button
    class="input add-left"
    title="Add to the right"
    on:click={() => addStop(0, 0)}>+</button
  >
  <div class="stops">
    {#each $state.tones as stop, i}
      <div class="stop">
        <input
          type="text"
          class="input"
          inputmode="numeric"
          pattern="\d*"
          value={stop}
          on:beforeinput={restrictStopInput}
          on:keydown={(e) => handleStopKey(e, i)}
          on:blur={(e) => validateAndUpdateStop(e.currentTarget, i)}
        />
        {#if $state.tones.length > 1}
          <div class="remove">
            <RemoveButton title="Remove stop" on:click={() => removeStop(i)} />
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <button
    class="input add-right"
    title="Add to the right"
    on:click={() => addStop(100, $state.tones.length)}>+</button
  >

  {#each $state.defs as palette, i}
    <article class="palette">
      <header>
        <input
          type="text"
          class="input"
          value={palette.name}
          on:input={(e) => renamePalette(i, e.currentTarget.value)}
        />
        {#if $state.defs.length > 1}
          <div class="remove">
            <RemoveButton
              title="Remove palette"
              on:click={() => removePalette(i)}
            />
          </div>
        {/if}
      </header>
      <div class="palette-editor">
        <div
          class="ramp"
          style:background={$palettes.get(palette.name).gradient}
        />
        <div class="palette-stops">
          {#each $palettes.get(palette.name).stops as stop}
            <div
              class="palette-stop"
              style:background-color={stop.color}
              style:color={stop.labelColor}
            >
              <div class="tooltip">{stop.color}</div>
            </div>
          {/each}
        </div>
        <PaletteEditor
          colors={palette.keyColors}
          on:update={(ev) => updatePalette(i, ev.detail)}
        />
      </div>
    </article>
  {/each}

  <button class="input add-palette" title="Add palette" on:click={addPalette}
    >+</button
  >
</main>

<div class="export">
  <h2><a href="https://huetone.ardov.me/">Huetone</a>-compatible JSON</h2>
  <textarea readonly class="input">{$huetoneJson}</textarea>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: 12ch 2em 1fr 2em;
    gap: 16px 4px;
  }

  .settings {
    grid-column: span 4;
    text-align: right;
  }

  .export {
    background-color: var(--neutral-40);
    border-radius: 2px;
    margin-top: 64px;
    padding: 8px;
  }
  h2 {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.2em;
  }
  .export textarea {
    border: 0;
    color: var(--neutral-70);
    margin-top: 8px;
    width: 100%;
    height: 20em;
  }

  .stops {
    display: flex;
    grid-column: 3 / 4;
  }
  .stop {
    position: relative;
    flex: 1;
  }
  .stop input {
    box-sizing: border-box;
    font-family: inherit;
    font-size: 1.5rem;
    text-align: center;
    width: 100%;
    height: 2.5em;
  }
  .stop:not(:first-child) input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .stop:not(:last-child) input {
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .stop input:focus {
    border-color: var(--neutral-80);
    box-shadow: 0 1px 5px var(--neutral-60);
    outline: none;
  }
  .remove {
    position: absolute;
    left: 1px;
    top: 1px;
  }
  .stop:not(:hover) .remove,
  header:not(:hover) .remove {
    display: none;
  }

  .add-left {
    grid-column: 2/3;
  }
  .add-right {
    grid-column: 4/5;
  }
  .add-palette {
    grid-column: 1/2;
    height: 2em;
  }

  .palette {
    display: contents;
  }
  header {
    display: flex;
    align-items: center;
    grid-column: 1/2;
    justify-content: center;
    position: relative;
  }
  header input {
    width: 100%;
  }
  .palette-editor {
    grid-column: 3/4;
  }
  .palette-stops {
    display: flex;
    margin-bottom: 4px;
  }
  .palette-stop {
    flex: 1;
    height: 2.5em;
    position: relative;
  }
  .palette-stop:not(:hover) .tooltip {
    display: none;
  }
  .tooltip {
    position: absolute;
    white-space: nowrap;
    font-size: 0.6rem;
  }
  .ramp {
    height: 0.5em;
  }
</style>
