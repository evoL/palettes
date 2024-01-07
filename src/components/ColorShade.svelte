<script lang="ts">
  export let color: string;
  export let textColor: string;
  export let value: number;
  export let name: string|undefined = undefined;

  let copyStatus: "copy" | "check-circle" = "copy";

  function requestCopy(color: string) {
    navigator.clipboard.writeText(color).then(() => {
      copyStatus = "check-circle";
    });
  }

  function resetCopyStatus() {
    copyStatus = "copy";
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case " ":
      case "Enter":
        event.preventDefault();
        requestCopy(color);
        break;
      case "Tab":
        resetCopyStatus();
        break;
    }
  }
</script>

<div class="shade">
  <h4 class="label">
    <sl-icon name="lightbulb" label="Lightness" />
    <span>{Math.round(value * 10000) / 100}</span>
    {#if name}
      <sl-icon name="bookmark" label="Tone" />
      <span>{name}</span>
    {/if}
  </h4>
  <div
    class="color"
    role="button"
    tabindex="0"
    style:--color={color}
    style:--text-color={textColor}
    on:click={() => requestCopy(color)}
    on:keyup={handleKeydown}
    on:mouseleave={() => resetCopyStatus()}
  >
    <div class="overlay">
      <span class="hex">{color}</span>
      <sl-icon name={copyStatus} />
    </div>
  </div>
</div>

<style>
  .shade {
    display: flex;
    flex-direction: column;
    gap: var(--sl-spacing-x-small);
    height: 100%;
    width: 100%;
  }

  .label {
    align-items: center;
    color: var(--sl-color-neutral-500);
    display: grid;
    gap: 0 var(--sl-spacing-2x-small);
    grid-template-columns: auto auto;
    font-weight: normal;
    font-family: var(--sl-font-mono);
    font-size: var(--sl-font-size-2x-small);
    justify-content: center;
  }

  .color {
    background: var(--color);
    color: var(--text-color);
    cursor: pointer;
    flex: 1;
    position: relative;
  }

  .overlay {
    align-items: center;
    background-color: inherit;
    bottom: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: var(--sl-font-mono);
    font-size: var(--sl-font-size-small);
    justify-content: center;
    left: 50%;
    padding: var(--sl-spacing-medium);
    pointer-events: none;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    z-index: 1;
  }

  .shade:focus {
    outline: none;
  }

  .shade:focus .overlay {
    border-radius: var(--sl-border-radius-small);
    outline: 2px solid;
  }

  .shade:not(:hover):not(:focus) .overlay {
    display: none;
    white-space: nowrap;
  }

  .hex {
    margin-bottom: var(--sl-spacing-2x-small);
  }
</style>
