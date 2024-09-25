<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js";
  import { autofocus } from "../lib/actions";
  import type { Project } from "../lib/types";
  import { DEFAULT_NAME } from "../lib/model";

  export let projects: Project[];
  export let activeIndex: number = 0;

  let form: HTMLFormElement | undefined = undefined;
  let isEditing = false;

  const dispatch = createEventDispatcher<{
    add: void;
    remove: void;
    rename: string;
    activeIndexChange: number;
  }>();

  function startEditing() {
    isEditing = true;
  }

  function confirmNameChange() {
    const data = serialize(form);
    const name = data["name"] as string;
    dispatch("rename", name || DEFAULT_NAME);
    isEditing = false;
  }

  function cancelNameChange() {
    isEditing = false;
  }

  function handleIndexChange(newIndex: number) {
    if (newIndex === projects.length) {
      // Add project
      dispatch("add");
    } else {
      // Select index
      dispatch("activeIndexChange", newIndex);
    }
  }
</script>

<div class="project-picker">
  {#if isEditing}
    <form
      bind:this={form}
      on:submit={(e) => {
        e.preventDefault();
        confirmNameChange();
      }}
    >
      <sl-input
        placeholder={DEFAULT_NAME}
        size="small"
        name="name"
        value={projects[activeIndex].name}
        use:autofocus
        on:keydown={(e) => {
          if (e.key === "Escape") {
            cancelNameChange();
          }
        }}
      />
      <sl-icon-button
        name="check-circle"
        class="action action--confirm"
        label="Confirm new name"
        on:click={(e) => confirmNameChange()}
      />
    </form>
  {:else}
    <sl-select
      size="small"
      value={String(activeIndex)}
      on:sl-change={(e) => handleIndexChange(Number(e.target.value))}
    >
      {#each projects as p, i}
        <sl-option value={String(i)}>{p.name}</sl-option>
      {/each}
      <sl-option value={String(projects.length)}>
        <sl-icon slot="prefix" name="plus-lg" />
        Add project
      </sl-option>
    </sl-select>

    <sl-tooltip content="Edit name">
      <sl-icon-button
        name="pencil"
        class="action action--edit"
        label="Edit name"
        on:click={startEditing}
      />
    </sl-tooltip>
    {#if projects.length > 1}
      <sl-tooltip content="Remove project">
        <sl-icon-button
          class="action action--delete"
          name="trash"
          label="Remove project"
          on:click={() => dispatch("remove")}
        />
      </sl-tooltip>
    {/if}
  {/if}
</div>

<style>
  .project-picker {
    display: flex;
  }
  .project-picker form {
    display: contents;
  }

  sl-select,
  sl-input {
    flex: 1;
  }
</style>
