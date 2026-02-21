import { useState, useEffect, useRef, useCallback } from "react";

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3.0;
const FIT_PADDING = 40;

// Normalise WheelEvent.deltaY across delta modes
// Mode 0 = pixel, Mode 1 = line (~20px), Mode 2 = page (~300px)
const DELTA_SCALE: Record<number, number> = { 0: 1, 1: 20, 2: 300 };

export interface FlowViewport {
  panX: number;
  panY: number;
  zoom: number;
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export function useFlowViewport(
  vpRef: React.RefObject<HTMLDivElement | null>,
  canvasW: number,
  canvasH: number
): FlowViewport {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Refs for drag state — never cause re-renders
  const isPanning = useRef(false);
  const spaceHeld = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });

  const fitView = useCallback(() => {
    const el = vpRef.current;
    if (!el || canvasW === 0 || canvasH === 0) return;
    const { offsetWidth: vw, offsetHeight: vh } = el;
    const scale = Math.min(
      vw / (canvasW + FIT_PADDING * 2),
      vh / (canvasH + FIT_PADDING * 2),
      1
    );
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
    setPanX((vw - canvasW * clamped) / 2);
    setPanY((vh - canvasH * clamped) / 2);
    setZoom(clamped);
  }, [vpRef, canvasW, canvasH]);

  // Fit on mount and whenever canvas dimensions change.
  // rAF ensures the browser has finished layout before we measure offsetWidth/Height.
  useEffect(() => {
    const id = requestAnimationFrame(() => fitView());
    return () => cancelAnimationFrame(id);
  }, [fitView]);

  // Event listeners — attached as raw DOM listeners so we can use
  // { passive: false } on wheel (required for preventDefault to work)
  // and avoid React's synthetic event batching overhead on mousemove.
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = e.deltaY * (DELTA_SCALE[e.deltaMode] ?? 1);
      const factor = Math.pow(0.999, raw);
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      setZoom((z) => {
        const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor));
        const r = nz / z;
        // Keep the canvas point under the cursor fixed
        setPanX((px) => mx - r * (mx - px));
        setPanY((py) => my - r * (my - py));
        return nz;
      });
    };

    const startPan = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && spaceHeld.current)) {
        e.preventDefault();
        isPanning.current = true;
        lastPtr.current = { x: e.clientX, y: e.clientY };
        el.style.cursor = "grabbing";
      }
    };
    const movePan = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPtr.current.x;
      const dy = e.clientY - lastPtr.current.y;
      lastPtr.current = { x: e.clientX, y: e.clientY };
      setPanX((p) => p + dx);
      setPanY((p) => p + dy);
    };
    const stopPan = () => {
      isPanning.current = false;
      el.style.cursor = spaceHeld.current ? "grab" : "";
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spaceHeld.current) {
        spaceHeld.current = true;
        el.style.cursor = "grab";
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
        if (!isPanning.current) el.style.cursor = "";
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", startPan);
    window.addEventListener("mousemove", movePan);
    window.addEventListener("mouseup", stopPan);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", startPan);
      window.removeEventListener("mousemove", movePan);
      window.removeEventListener("mouseup", stopPan);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [vpRef]); // vpRef is a stable ref object — this runs once on mount

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.25)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.25)),
    []
  );

  return { panX, panY, zoom, fitView, zoomIn, zoomOut };
}
