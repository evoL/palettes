<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ManualStops } from "../lib/types";

  const dispatch = createEventDispatcher<{
    update: ManualStops;
  }>();

  export let stops: ManualStops;

  $: values = stops.values;
</script>

<div class="values" style:--num-values={values.length}>
  <sl-icon-button
    class="add first"
    name="plus"
    size="small"
    on:click={(e) => {
      values.unshift(values[0]);
      values = values;
      dispatch("update", { ...stops, values });
    }}
  />
  {#each values as value, i}
    <sl-icon-button
      class="delete"
      name="x"
      size="small"
      on:click={(e) => {
        values.splice(i, 1);
        values = values;
        dispatch("update", { ...stops, values });
      }}
    />
    <sl-input
      class="value"
      value={Math.round(value * 1000) / 10}
      on:sl-change={(e) => {
        values[i] = e.target.value / 100;
        dispatch("update", { ...stops, values });
      }}
    />
  {/each}
  <sl-icon-button
    class="add last"
    name="plus"
    size="small"
    on:click={(e) => {
      values.push(values[values.length - 1]);
      values = values;
      dispatch("update", { ...stops, values });
    }}
  />
</div>

<style>
  .values {
    display: grid;
    grid-template-columns: auto repeat(1fr, var(--num-values)) auto;
  }

  .values::before {
    content: '';
    grid-row: 1;
    grid-column: 1;
  }

  .delete {
    justify-self: center;
  }

  .add {
    grid-row: 2;
    align-self: center;
  }

  .value {
    grid-row: 2;
    overflow: auto;
  }

  .value::part(input) {
    padding: var(--sl-spacing-2x-small);
    text-align: center;
  }
</style>
