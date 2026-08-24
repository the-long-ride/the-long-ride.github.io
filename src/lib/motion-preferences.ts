export type MotionMode = "full" | "reduced" | "static";
export type MotionPreferenceInput = { reducedMotion: boolean; coarsePointer: boolean };
export function getMotionMode({ reducedMotion, coarsePointer }: MotionPreferenceInput): MotionMode {
  if (coarsePointer) return "static";
  if (reducedMotion) return "reduced";
  return "full";
}
