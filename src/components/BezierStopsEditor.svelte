<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import throttle from "lodash-es/throttle";
  import { type ColorSpace } from "colorjs.io/fn";

  import type { BezierStops, Curve, Point } from "../lib/types";
  import { generateLightnessGradient } from "../lib/colors";
  import {
    CURVES,
    CURVE_LIST,
    USER_CURVES,
    findCurvePreset,
    getPresetList,
  } from "../lib/presets";

  import PresetForm from "./PresetForm.svelte";

  const dispatch = createEventDispatcher<{
    update: BezierStops;
  }>();

  export let stops: BezierStops;
  export let colorSpace: ColorSpace;
  export let isInverted: boolean;
  let width: number = 2137;
  const HEIGHT = 140;

  let activePoint: 0 | 1 | 2 | 3 | undefined;
  $: viewBox = `0 0 ${width} ${HEIGHT}`;
  $: renderedCurve = projectCurve(stops.curve, width);
  $: lightnessGradient = generateLightnessGradient(colorSpace, isInverted);

  $: userCurveList = getPresetList($USER_CURVES);
  $: curvePreset = findCurvePreset(stops.curve, userCurveList, CURVE_LIST);

  function projectCurve(c: Curve, w: number): Curve {
    return c.map(({ x, y }) => ({
      x: x * w,
      y: (1 - y) * HEIGHT,
    })) as Curve;
  }

  function unprojectCurve(c: Curve, w: number): Curve {
    return c.map(({ x, y }) => ({
      x: x / w,
      y: 1 - y / HEIGHT,
    })) as Curve;
  }

  function handleMouseDown(event: MouseEvent) {
    const target = event.target as SVGCircleElement;
    if (target.classList.contains("one")) {
      activePoint = 1;
    } else if (target.classList.contains("two")) {
      activePoint = 2;
    } else {
      activePoint = undefined;
    }
  }

  function handleMouseUp(_event: MouseEvent) {
    activePoint = undefined;
  }

  function handleMouseMove(event: MouseEvent) {
    if (activePoint == null) return;
    renderedCurve[activePoint] = {
      x: Math.max(0, Math.min(width, event.offsetX)),
      y: Math.max(0, Math.min(HEIGHT, event.offsetY)),
    };
    dispatchUpdate();
  }

  function update(change: Partial<BezierStops>) {
    dispatch("update", { ...stops, ...change });
  }

  const dispatchUpdate = throttle(
    () => update({ curve: unprojectCurve(renderedCurve, width) }),
    66 // 15 FPS
  );

  function d(command: string, ...points: Point[]) {
    return command + points.map((p) => `${p.x},${p.y}`).join(" ");
  }
</script>

<svelte:window on:mouseup={handleMouseUp} />

<PresetForm
  builtins={CURVE_LIST}
  userPresets={userCurveList}
  current={curvePreset?.id}
  label="Curve preset"
  saveLabel="Save curve"
  on:change={(e) =>
    update({ curve: ($USER_CURVES[e.detail] ?? CURVES[e.detail]).content })}
  on:save={(e) => {
    USER_CURVES.add({
      ...e.detail,
      content: unprojectCurve(renderedCurve, width),
    });
  }}
  on:rename={(e) => {
    const { id, name } = e.detail;
    USER_CURVES.update(id, (preset) => ({ ...preset, name }));
  }}
  on:delete={(e) => USER_CURVES.delete(e.detail)}
/>

<sl-input
  class="num-stops"
  type="number"
  size="small"
  label="Number of stops"
  min={stops.skipExtremes ? 1 : 3}
  value={stops.numStops}
  on:sl-change={(e) => update({ numStops: Number(e.target.value) })}
/>
<sl-checkbox
  size="small"
  checked={stops.skipExtremes}
  on:sl-change={(e) =>
    update({
      skipExtremes: e.target.checked,
      numStops: Math.max(e.target.checked ? 1 : 3, stops.numStops),
    })}>Exclude black and white</sl-checkbox
>

<div class="container" bind:clientWidth={width}>
  <svg class="editor" {viewBox} on:mousemove={handleMouseMove}>
    <defs>
      <linearGradient id="gradient" x1="0" y1="1" x2="0" y2="0">
        {#each lightnessGradient as color, i}
          <stop
            offset={i / (lightnessGradient.length - 1)}
            stop-color={color}
          />
        {/each}
      </linearGradient>
    </defs>

    <path class="bg" d={`M0 0h${width}v${HEIGHT}H0z`} />

    <path
      class="curve"
      d={d("M", renderedCurve[0]) + d("C", ...renderedCurve.slice(1))}
    />

    <path
      class="guide"
      d={d("M", renderedCurve[0]) + d("L", renderedCurve[1])}
    />
    <circle
      role="button"
      class="handle one"
      class:active={activePoint === 1}
      cx={renderedCurve[1].x}
      cy={renderedCurve[1].y}
      transform-origin={`${renderedCurve[1].x} ${renderedCurve[1].y}`}
      r="5"
      on:mousedown={handleMouseDown}
    />
    <path
      class="guide"
      d={d("M", renderedCurve[3]) + d("L", renderedCurve[2])}
    />
    <circle
      role="button"
      class="handle two"
      class:active={activePoint === 2}
      cx={renderedCurve[2].x}
      cy={renderedCurve[2].y}
      transform-origin={`${renderedCurve[2].x} ${renderedCurve[2].y}`}
      r="5"
      on:mousedown={handleMouseDown}
    />
  </svg>
</div>

<style>
  .num-stops {
    display: inline-block;
    margin: var(--sl-spacing-x-small) var(--sl-spacing-medium) var(--sl-spacing-small) 0;
  }

  .num-stops::part(form-control) {
    align-items: center;
    display: grid;
    grid: auto / min-content 10ch;
    gap: var(--sl-spacing-small);
  }

  .num-stops::part(form-control-label) {
    white-space: nowrap;
  }

  .editor {
    overflow: visible;
  }

  .bg {
    fill: url(#gradient);
  }
  .guide {
    filter: drop-shadow(0 0 1px #fff);
    stroke: #000;
  }
  .handle {
    fill: var(--sl-color-neutral-300);
    stroke: #000;
    transition: transform var(--sl-transition-x-fast);
  }
  .handle:hover {
    transform: scale(1.5);
  }
  .curve {
    fill: none;
    stroke: var(--sl-color-primary-600);
    stroke-width: 2px;
  }
</style>
