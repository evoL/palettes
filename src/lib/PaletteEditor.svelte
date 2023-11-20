<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import RemoveButton from "./RemoveButton.svelte";

  export let colors: string[] = [];

  const dispatch = createEventDispatcher<{
    update: string[];
  }>();

  function addColor() {
    colors = [...colors, '#abcdef'];
    console.log('add');
    dispatch('update', colors);
  }

  function updateColor(index: number, newColor: string) {
    colors = colors.map((c, i) => i === index ? newColor : c);
    dispatch('update', colors);
  }

  function removeColor(index: number) {
    colors = [...colors.slice(0, index), ...colors.slice(index+1)];
    dispatch('update', colors);
  }
</script>

<div class="colors">
  {#each colors as color, i}
  <span class="color">
    <input type="color" class="tile" value={color} on:input={(e) => updateColor(i, e.currentTarget.value)} />
    {#if colors.length > 1}
    <div class="remove">
      <RemoveButton title="Remove color" on:click={(e) => removeColor(i)} />
    </div>
    {/if}
  </span>
  {/each}
  <button class="input tile" title="Add color" on:click={addColor}>+</button>
</div>

<style>
  .tile {
    appearance: none;
    display: inline-block;
    width: 2em;
    height: 2em;
    border: 1px solid var(--neutral-60);
    border-radius: 2px;
    padding: 0;
    margin-right: 4px;
  }

  button {
    vertical-align: top;
  }
  
  .color {
    display: inline-block;
    position: relative;
  }
  .remove {
    position: absolute;
    left: 1px;
    top: 1px;
  }
  .color:not(:hover) .remove {
    display: none;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  input[type="color"]::-webkit-color-swatch {
    border: 0;
  }
</style>
