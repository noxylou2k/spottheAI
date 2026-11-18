"use client";

import FluxLines from "@/components/FluxLines";

export default function Scene() {
  return (
    <div
      className="backdrop"
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <FluxLines
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        colors={["#38bdf8", "#eef3fb", "#7dd3fc", "#ffffff"]}
        backgroundColor="#070b14"
        transparent={false}
        speed={0.4}
        scale={1.35}
        glow={1.6}
        shimmer={1.1}
        opacity={1}
        flowDirection="down"
        mouseInteraction
        clickSwirl
      />
    </div>
  );
}
