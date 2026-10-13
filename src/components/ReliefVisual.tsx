export function ReliefVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relief-scene ${compact ? "relief-compact" : ""}`}
      aria-label="Abstract 2.5D relief visual"
      role="img"
    >
      <div className="scene-glow" />
      <div className="relief-blob relief-blob-a" />
      <div className="relief-blob relief-blob-b" />
      <div className="relief-blob relief-blob-c" />
      <div className="relief-grid" />
      <span className="scene-label scene-label-top">DEPTH MAP / 01</span>
      <span className="scene-label scene-label-bottom">TACTURA ENGINE</span>
    </div>
  );
}
