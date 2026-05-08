import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Music2 } from "lucide-react";

export function AudioPlayer({ src, title, artist }: {
  src: string;
  title?: string | null;
  artist?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [needsTap, setNeedsTap] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  // Try to autoplay on mount
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.play()
      .then(() => {
        setPlaying(true);
        setNeedsTap(false);
      })
      .catch(() => {
        setNeedsTap(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const setupAnalyser = () => {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      /* ignore */
    }
  };

  // Visualizer loop
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return null;
    }
    setupAnalyser();
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const barW = w / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const barH = v * h;
        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "var(--neon-primary)");
        grad.addColorStop(1, "var(--neon-accent)");
        ctx.fillStyle = `rgba(168,85,247,${0.4 + v * 0.6})`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    if (a.paused) {
      await a.play();
      setPlaying(true);
      setNeedsTap(false);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-3 flex items-center gap-3 shadow-lg">
      <audio ref={audioRef} src={src} loop preload="auto" crossOrigin="anonymous" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="h-10 w-10 shrink-0 rounded-full grid place-items-center neon-border bg-black/40 hover:scale-105 transition"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          <Music2 className="h-3 w-3" />
          {needsTap ? "tap play" : playing ? "now playing" : "paused"}
        </div>
        <div className="text-sm font-medium truncate">{title || "Sem título"}</div>
        {artist && <div className="text-xs text-muted-foreground truncate">{artist}</div>}
        <canvas ref={canvasRef} width={160} height={18} className="mt-1 w-full h-[18px]" />
      </div>

      <div className="hidden sm:flex items-center gap-2 pr-1">
        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-20 accent-[var(--neon-primary)]"
        />
      </div>
    </div>
  );
}
