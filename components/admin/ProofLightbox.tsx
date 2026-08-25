"use client";

import { useEffect, useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface Props {
  src: string;
  filename?: string;
  onClose: () => void;
}

export default function ProofLightbox({ src, filename, onClose }: Props) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key.toLowerCase() === "r") setRotation((r) => (r + 90) % 360);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const downloadName =
    filename || src.split("/").pop() || `proof-${Date.now()}.png`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between p-3 bg-black/60 border-b border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-mono text-xs truncate max-w-[280px] sm:max-w-md">
            {downloadName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-2 rounded text-gray-300 hover:bg-gray-800"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
            className="p-2 rounded text-gray-300 hover:bg-gray-800"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded text-gray-300 hover:bg-gray-800"
            title="Rotate (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <a
            href={src}
            download={downloadName}
            className="p-2 rounded text-gray-300 hover:bg-gray-800"
            title="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded text-gray-300 hover:bg-gray-800 ml-1"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-auto p-4"
        onClick={onClose}
      >
        <img
          src={src}
          alt="Deposit proof"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded shadow-2xl"
        />
      </div>

      <div className="text-center text-xs text-gray-500 pb-3">
        Esc to close · +/- to zoom · R to rotate
      </div>
    </div>
  );
}
