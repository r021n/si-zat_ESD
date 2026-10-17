export interface SimState {
  pH: number;
  DO: number;
  BOD: number;
  COD: number;
  pollutant: number;
}

export type FishState = "alive" | "struggling" | "dead";

export const INITIAL_VALUES: SimState = {
  pH: 7.0,
  DO: 8.0,
  BOD: 1.5,
  COD: 5.0,
  pollutant: 0.0,
};
