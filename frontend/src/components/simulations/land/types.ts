export interface SimState {
  pH: number;
  fertility: number;
  rootHealth: number;
  toxicity: number;
  yield: number;
}

export type TrashType = "organik" | "anorganik";
export type FishState = "alive" | "struggling" | "dead";

export interface WasteSprite {
  subtype: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export const INITIAL_VALUES: SimState = {
  pH: 7.0,
  fertility: 80.0,
  rootHealth: 100.0,
  toxicity: 0.0,
  yield: 0.0,
};

export const getSurfaceY = (x: number, pondStartX: number, time: number): number => {
  if (x < pondStartX) {
    return 100;
  }
  return 100 + Math.sin(x * 0.05 + time * 0.06) * 1.5;
};
