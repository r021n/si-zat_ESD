export interface SimState {
  AQI: number;
  PM25: number;
  CO2: number;
  CO: number;
  O2: number;
}

export type CitizenState = "healthy" | "coughing";

export const INITIAL_VALUES: SimState = {
  AQI: 20.0,
  PM25: 12.0,
  CO2: 390.0,
  CO: 1.5,
  O2: 21.0,
};
