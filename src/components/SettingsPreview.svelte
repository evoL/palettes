<script lang="ts">
  import { COLOR_SPACE_TYPES, LIGHT_OR_DARK, STOP_TYPES } from "../lib/display_names";
  import type { ColorSpaceType, StopType } from "../lib/types";

  export let stopType: StopType;
  export let colorSpaceType: ColorSpaceType;
  export let isInverted: boolean;
</script>

<dl>
  <dt>Stops</dt>
  <dd>{STOP_TYPES[stopType]}</dd>

  <dt>Color space</dt>
  <dd>{COLOR_SPACE_TYPES[colorSpaceType]}</dd>

  <dt>Order</dt>
  <dd>{LIGHT_OR_DARK[+isInverted]}</dd>
</dl>

<style>
  dt, dd {
    display: inline;
    line-height: var(--sl-line-height-dense);
  }

  dt {
    font-weight: bold;
    margin-right: var(--sl-spacing-2x-small);
  }

  dt::before {
    content: '';
    display: block;
  }
  dt::after {
    content: ':';
  }
</style>
