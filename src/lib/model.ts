import { derived, writable } from "svelte/store";
import { ColorSpaceType, StopType, type Project } from "./types";
import { CURVES } from "./presets";

export const DEFAULT_NAME = 'Untitled Project';

export const DEFAULT_PROJECT: Project = {
  name: DEFAULT_NAME,
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

export function addProject() {
  store.update((state) => {
    state.projects.push({...DEFAULT_PROJECT});
    state.activeIndex = state.projects.length - 1;
    return state;
  });
}

export function removeActiveProject() {
  store.update((state) => {
    if (state.projects.length <= 1) return state;

    state.projects.splice(state.activeIndex, 1);
    if (state.activeIndex >= state.projects.length) {
      state.activeIndex = state.projects.length - 1;
    }
    return state;
  });
}

export function renameActiveProject(name: string) {
  store.update((state) => {
    state.projects[state.activeIndex].name = name;
    return state;
  });
}

export function setActiveIndex(index: number) {
  store.update((state) => {
    state.activeIndex = index;
    return state;
  });
}
