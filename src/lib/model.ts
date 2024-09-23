import { derived, writable } from "svelte/store";
import { ColorSpaceType, StopType, type Project } from "./types";
import { CURVES } from "./presets";

export const DEFAULT_PROJECT: Project = {
  name: 'Untitled Project',
  stops: {
    type: StopType.BEZIER,
    numStops: 13,
    curve: CURVES["default"].content,
  },
  colorRamps: [],
  colorSpaceType: ColorSpaceType.OKLAB,
  isInverted: false,
};

export const store = writable({
  projects: [DEFAULT_PROJECT],
  activeIndex: 0,
});

export const projectStore = derived(
  store,
  (s) => s.projects[s.activeIndex],
  DEFAULT_PROJECT,
);

export function updateProject(changes: Partial<Project> = {}) {
  store.update((state) => {
    Object.assign(state.projects[state.activeIndex], changes);
    return state;
  });
}
