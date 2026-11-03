/**
 * SoundToggle — global on/off for every sound in the app.
 * Uses the native switch (`role="switch"`), remembers the choice, and plays a
 * tap when turned on so the user hears that it works.
 *
 * @example
 *   <SoundToggle />
 *   <SoundToggle label="Efectos de sonido" />
 */
import { useSoundEnabled } from "../../lib/sound";

export function SoundToggle({ label = "Sonidos" }: { label?: string }) {
  const [enabled, setEnabled] = useSoundEnabled();
  return (
    <label>
      <span>
        {enabled ? "🔊" : "🔇"} {label}
      </span>
      <input type="checkbox" role="switch" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
    </label>
  );
}
