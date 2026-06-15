import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

export function CropDialog({
  file,
  aspect,
  onCancel,
  onDone,
}: {
  file: File;
  aspect: number; // 0 = free
  onCancel: () => void;
  onDone: (cropped: File) => void;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, px: Area) => setPixels(px), []);

  const finalize = async () => {
    if (!pixels) return;
    setBusy(true);
    try {
      const img = await loadImg(url);
      const canvas = document.createElement("canvas");
      canvas.width = pixels.width;
      canvas.height = pixels.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, pixels.width, pixels.height);
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), file.type || "image/jpeg", 0.92));
      const out = new File([blob], file.name.replace(/\.\w+$/, "") + "-cropped." + (file.type.includes("png") ? "png" : "jpg"), {
        type: blob.type,
      });
      URL.revokeObjectURL(url);
      onDone(out);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0418] p-4 space-y-3">
        <h3 className="text-sm font-semibold">recortar imagem</h3>
        <div className="relative h-72 w-full rounded-lg overflow-hidden bg-black">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            objectFit="contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">zoom</span>
          <input type="range" min={1} max={4} step={0.05} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => { URL.revokeObjectURL(url); onCancel(); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10">cancelar</button>
          <button onClick={finalize} disabled={busy || !pixels}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--neon-primary)]/50 bg-[var(--neon-primary)]/20 text-[var(--neon-primary)] disabled:opacity-50">
            {busy ? "processando…" : "recortar & usar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
