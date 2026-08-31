import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/utils/common/classnames";

const SPEEDS = [0.75, 1, 1.25];

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface AudioPlayerProps {
  src: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTimeUpdate?: (time: number) => void;
  onSeeked?: (time: number) => void;
  onPlay?: () => void;
  className?: string;
}

export default function AudioPlayer({
  src,
  audioRef,
  onTimeUpdate,
  onSeeked,
  onPlay,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  // While the user is dragging the slider, ignore the native "timeupdate" ticks so
  // they don't fight the thumb back to the (not-yet-seeked) playback position.
  const isDraggingRef = useRef(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const setSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <Button
        type="button"
        variant="default"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full shadow-[0_0_12px_2px_rgba(34,197,94,0.3)] hover:shadow-[0_0_16px_3px_rgba(34,197,94,0.4)]"
        onClick={togglePlay}
        title={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-9 text-right">
        {formatTime(displayTime)}
      </span>

      <Slider
        value={[Math.min(displayTime, duration || 0)]}
        min={0}
        max={duration || 0.01}
        step={0.1}
        disabled={!duration}
        onValueChange={([value]) => {
          isDraggingRef.current = true;
          setDisplayTime(value);
        }}
        onValueCommit={([value]) => {
          isDraggingRef.current = false;
          const audio = audioRef.current;
          if (audio) audio.currentTime = value;
        }}
        className="flex-1"
      />

      <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-9">
        {formatTime(duration)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-xs shrink-0">
            {playbackRate}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SPEEDS.map((speed) => (
            <DropdownMenuItem key={speed} onClick={() => setSpeed(speed)}>
              {speed}x{speed === playbackRate ? " ✓" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => {
          setIsPlaying(true);
          onPlay?.();
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (!isDraggingRef.current) setDisplayTime(t);
          onTimeUpdate?.(t);
        }}
        onSeeked={(e) => {
          const t = e.currentTarget.currentTime;
          if (!isDraggingRef.current) setDisplayTime(t);
          onSeeked?.(t);
        }}
      />
    </div>
  );
}
