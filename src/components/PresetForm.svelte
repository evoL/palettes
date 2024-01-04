<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
    import type SlOption from "@shoelace-style/shoelace/dist/components/option/option.component";
  import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component";
  import { type Preset } from "../lib/presets";
  import { randomString } from "../lib/util";

  export let builtins: Array<Preset<unknown>>;
  export let userPresets: Array<Preset<unknown>> = [];
  export let current: string | undefined = undefined;
  export let label = "Preset";
  export let saveLabel = "Save preset";

  let selectEl: SlSelect;
  let refreshSelect = false;

  $: allPresets = [...builtins, ...userPresets];
  $: currentPreset = current && allPresets.find(({ id }) => id === current);
  $: isBuiltin = builtins.indexOf(currentPreset) >= 0;

  function save() {
    const name = prompt("Enter a name:");
    if (!name) return;

    dispatch("save", { id: randomString(), name });
  }

  function rename() {
    const name = prompt("Enter a new name:", currentPreset.name);
    if (!name) return;

    refreshSelect = true;
    dispatch("rename", { id: currentPreset.id, name });
  }

  // Reflect the rename in the label of the selected preset.
  afterUpdate(() => {
    if (!refreshSelect) return;

    const options = [...selectEl.querySelectorAll<SlOption>('sl-option')];
    const selectedOption = options.find(o => o.selected);
    if (!selectedOption) return;

    selectEl.displayLabel = selectedOption.getTextLabel();
    refreshSelect = false;
  });

  const dispatch = createEventDispatcher<{
    change: string;
    save: { id: string; name: string };
    rename: { id: string; name: string };
    delete: string;
  }>();
</script>

<div class="preset-form">
  <sl-select
    {label}
    class="control"
    placeholder="Custom"
    size="small"
    value={current ?? ''}
    bind:this={selectEl}
    on:sl-change={(e) => dispatch("change", e.target.value)}
  >
    {#if userPresets.length}
      <small>Yours</small>
      <sl-divider />
      {#each userPresets as preset}
        <sl-option value={preset.id}>{preset.name}</sl-option>
      {/each}
      <sl-divider />
    {/if}
    <small>Built-in</small>
    <sl-divider />
    {#each builtins as preset}
      <sl-option value={preset.id}>{preset.name}</sl-option>
    {/each}
  </sl-select>

  {#if current == null}
    <sl-button size="small" on:click={save}>{saveLabel}</sl-button>
  {:else if !isBuiltin}
    <sl-tooltip content="Rename">
      <sl-icon-button name="pencil" on:click={rename} />
    </sl-tooltip>
    <sl-tooltip content="Delete">
      <sl-icon-button
        name="trash"
        on:click={(e) => dispatch("delete", current)}
      />
    </sl-tooltip>
  {/if}
</div>

<style>
  .preset-form {
    display: flex;
    align-items: center;
    gap: var(--sl-spacing-x-small);
  }
  .control {
    flex: 1;
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
