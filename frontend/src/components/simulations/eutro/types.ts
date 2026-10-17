export interface SimState {
  nutrient: number;
  algae: number;
  DO: number;
  BOD: number;
}

export type FishState = "alive" | "struggling" | "dead";

export const BASE_STATE: SimState = {
  nutrient: 2.0,
  algae: 10.0,
  DO: 8.0,
  BOD: 1.0,
};
