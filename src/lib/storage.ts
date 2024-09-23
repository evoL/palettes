import { ColorRamp } from "./colors";
import { type PersistedProject, type PersistedProjects, type Project } from "./types";

const STORAGE_KEY = "evolved_palettes";
let cachedStorage: Storage | undefined;

function getStorage(): Storage | undefined {
  if (cachedStorage) return cachedStorage;
  
  let storage: Storage;
  try {
    storage = localStorage;
    const testKey = '__evolved_test';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    cachedStorage = storage;
    return storage;
  } catch (e: unknown) {
    if (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      storage &&
      storage.length !== 0
    ) {
      cachedStorage = storage;
      return storage;
    }
    return undefined;
  }
}

export function loadProjects(): PersistedProjects | null {
  const storage = getStorage();
  if (!storage) return null;

  const content = storage.getItem(STORAGE_KEY);
  if (content == null) return null;

  const parsed = JSON.parse(content) as PersistedProject | PersistedProjects;
  
  // If it's a single project, upgrade.
  if (isSingleProject(parsed)) {
    return {
      projects: [parsed],
      activeIndex: 0,
    };
  }

  return parsed;
}

export function saveProjects(projects: PersistedProjects): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function fromPersisted(persisted: PersistedProject): Project {
  return {
    name: 'Untitled Project',
    ...persisted,
    colorRamps: persisted.colorRamps.map(({name, colors}) => new ColorRamp(colors, name)),
  };
}

export function toPersisted(project: Project): PersistedProject {
  return {
    ...project,
    colorRamps: project.colorRamps.map((ramp) => ramp.toJSON()),
  };
}

function isSingleProject(thing: object): thing is PersistedProject {
  return [
    'stops',
    'colorRamps',
    'colorSpaceType',
    'isInverted',
  ].every(key => Object.hasOwn(thing, key));
}
