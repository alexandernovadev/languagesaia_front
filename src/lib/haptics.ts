/**
 * Haptics — tiny vibrations that confirm what happened.
 * Android only: iOS Safari does not expose `navigator.vibrate`, so it is a silent no-op there.
 *
 * @example
 *   haptics.success(); // short tick on a correct answer
 *   haptics.error();   // double buzz on a wrong one
 */
const vibrate = (pattern: number | number[]): boolean => {
  try {
    return typeof navigator !== "undefined" && "vibrate" in navigator && navigator.vibrate(pattern);
  } catch {
    return false;
  }
};

export const haptics = {
  tap: () => vibrate(10),
  success: () => vibrate(30),
  error: () => vibrate([40, 60, 40]),
  celebrate: () => vibrate([30, 60, 30, 60, 60]),
  /** Returns false when the device cannot vibrate. */
  raw: vibrate,
};
