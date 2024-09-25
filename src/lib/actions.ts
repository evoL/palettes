import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";
import type { Action } from "svelte/action";

export const autofocus: Action<SlInput> = (input) => {
  input.updateComplete.then(() => {
    input.focus();
  });
};
