export const SCHOOL_OPTIONS = [
  "SMPN 1 Sukoharjo",
  "SMPN 5 Sukoharjo",
  "SMPN 1 Polokarto",
  "SMPN 1 Mojolaban",
  "SMPN 3 Mojolaban",
] as const;

export type SchoolOption = (typeof SCHOOL_OPTIONS)[number];
