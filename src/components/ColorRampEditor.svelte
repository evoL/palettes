<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { toSrgb, type ColorModel } from "../lib/colors";
  import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";

  export let name: string;
  export let keyColors: ColorModel[] = [];

  let nameInput: SlInput | undefined;
  let isEditing = false;

  const dispatch = createEventDispatcher<{
    addColor: void;
    updateColor: { index: number; color: string };
    removeColor: number;
    updateName: string;
    remove: void;
  }>();

  function confirmNameChange(newName: string | undefined) {
    if (newName !== name) {
      dispatch("updateName", newName);
    }
    isEditing = false;
  }
</script>

<div class="editor">
  {#if isEditing}
    <sl-input
      bind:this={nameInput}
      class="name input"
      value={name}
      placeholder="Cornflower Blue"
      on:sl-change={(e) => {
        confirmNameChange(e.target.value || undefined);
      }}
      on:keydown={(e) => {
        if (e.key === "Escape") {
          nameInput.value = name;
          isEditing = false;
        }
      }}
    />
    <sl-icon-button
      class="action action--confirm"
      name="check-circle"
      label="Confirm new name"
      on:click={() => {
        confirmNameChange(nameInput.value);
      }}
    />
  {:else}
    <h1 class="name">{name}</h1>
    <sl-icon-button
      class="action action--edit"
      name="pencil"
      label="Edit name"
      on:click={() => (isEditing = true)}
    />
  {/if}

  <ul>
    {#each keyColors as color, i}
      <li>
        <sl-tag
          class="key-color"
          class:removable={keyColors.length > 1}
          pill
          removable={keyColors.length > 1}
          on:sl-remove={() => {
            dispatch("removeColor", i);
          }}
        >
          <sl-color-picker
            class="key-color__picker"
            label={`Select color ${i + 1}`}
            size="small"
            value={toSrgb(color)}
            no-format-toggle
            on:sl-change={(e) => {
              dispatch("updateColor", { index: i, color: e.target.value });
            }}
          />
        </sl-tag>
      </li>
    {/each}
    <li>
      <sl-button
        variant="default"
        size="small"
        circle
        on:click={() => {
          dispatch("addColor");
        }}
      >
        <sl-icon name="plus-lg" label="Add color" />
      </sl-button>
    </li>
  </ul>

  <sl-icon-button
    class="action action--remove"
    name="trash"
    label="Remove ramp"
    on:click={() => {
      dispatch("remove");
    }}
  />
</div>

<style>
  .editor {
    align-items: center;
    display: grid;
    gap: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);
    grid-template-columns: 1fr auto;
  }

  h1 {
    font-size: var(--sl-font-size-large);
    line-height: 2.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action {
    grid-column: 2;
  }

  .action--remove {
    color: var(--sl-color-danger-600);
  }

  .name.input {
    overflow: auto;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sl-spacing-2x-small);
  }

  li {
    display: inline;
    list-style: none;
    vertical-align: top;
  }

  .key-color::part(base) {
    background: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-300);
    line-height: 1;
    padding-left: 0;
  }

  .key-color:not(.removable)::part(base) {
    padding-right: 0;
  }

  .key-color__picker::part(trigger)::before {
    box-shadow: inset 0 0 0 3px var(--sl-color-neutral-0);
  }

  @media (min-width: 720px) {
    .editor:not(:hover) .action:not(.action--confirm) {
      visibility: hidden;
    }

    .action--remove {
      align-self: end;
    }
  }

  @media (max-width: 720px) {
    .editor {
      display: flex;
    }
    .name {
      width: 40%;
    }
    ul {
      flex: 1;
      justify-content: flex-end;
    }
    .action {
      order: 1;
    }
  }
</style>
