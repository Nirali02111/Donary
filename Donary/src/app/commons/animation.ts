import {
  animate,
  animation,
  keyframes,
  style,
  state,
  transition,
  trigger,
  useAnimation,
} from "@angular/animations";

export const shake = animation(
  animate(
    "{{ timing }}s {{ delay }}s",
    keyframes([
      style({ transform: "translate3d(0, 0, 0)", offset: 0 }),
      style({ transform: "translate3d(-10px, 0, 0)", offset: 0.1 }),
      style({ transform: "translate3d(10px, 0, 0)", offset: 0.2 }),
      style({ transform: "translate3d(-10px, 0, 0)", offset: 0.3 }),
      style({ transform: "translate3d(10px, 0, 0)", offset: 0.4 }),
      style({ transform: "translate3d(-10px, 0, 0)", offset: 0.5 }),
      style({ transform: "translate3d(10px, 0, 0)", offset: 0.6 }),
      style({ transform: "translate3d(-10px, 0, 0)", offset: 0.7 }),
      style({ transform: "translate3d(10px, 0, 0)", offset: 0.8 }),
      style({ transform: "translate3d(-10px, 0, 0)", offset: 0.9 }),
      style({ transform: "translate3d(0, 0, 0)", offset: 1 }),
    ])
  ),
  { params: { timing: 1, delay: 0 } }
);

export const swing = animation(
  animate(
    "{{ timing }}s {{ delay }}s",
    keyframes([
      style({ transform: "rotate3d(0, 0, 1, 15deg)", offset: 0.2 }),
      style({ transform: "rotate3d(0, 0, 1, -10deg)", offset: 0.4 }),
      style({ transform: "rotate3d(0, 0, 1, 5deg)", offset: 0.6 }),
      style({ transform: "rotate3d(0, 0, 1, -5deg)", offset: 0.8 }),
      style({ transform: "rotate3d(0, 0, 1, 0deg)", offset: 1 }),

      // for less swing
      /*style({ transform: "rotate3d(0, 0, 1, 3deg)", offset: 0.2 }),
      style({ transform: "rotate3d(0, 0, 1, -3deg)", offset: 0.4 }),
      style({ transform: "rotate3d(0, 0, 1, 0deg)", offset: 0.6 }),
      style({ transform: "rotate3d(0, 0, 1, -3deg)", offset: 0.8 }),
      style({ transform: "rotate3d(0, 0, 1, 0deg)", offset: 1 }),*/
    ])
  ),
  { params: { timing: 1, delay: 0 } }
);

export const shakeTrigger = trigger("shakeTrigger", [
  state("false, true", style({})),
  transition("false => true", useAnimation(shake)),
]);

export const swingTrigger = trigger("swingTrigger", [
  state("false, true", style({})),
  transition("false => true", useAnimation(swing)),
]);
