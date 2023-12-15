<script lang="ts">
  export let color: string;
  export let textColor: string;
  export let value: number;

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
  <h4 class="value">{value}</h4>
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

  .value {
    color: var(--sl-color-neutral-500);
    font-weight: normal;
    font-family: var(--sl-font-mono);
    font-size: var(--sl-font-size-2x-small);
    text-align: center;
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
