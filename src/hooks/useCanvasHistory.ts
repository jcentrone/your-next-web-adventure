import {useCallback, useMemo, useState} from "react";
import type {Canvas as FabricCanvas} from "fabric";

export function useCanvasHistory(opts: {
    canvas: FabricCanvas | null;
    onBgFromJSON?: (bg: string) => void; // e.g., setBgColor
}) {
    const {canvas, onBgFromJSON} = opts;
    const [history, setHistory] = useState<string[]>([]);
    const [index, setIndex] = useState(-1);

    const canUndo = index > 0;
    const canRedo = index >= 0 && index < history.length - 1;

    const snapshot = useCallback(() => {
        if (!canvas) return;
        const json = JSON.stringify(canvas.toJSON());
        setHistory(prev => {
            const next = prev.slice(0, index + 1);
            next.push(json);
            return next;
        });
        setIndex(i => i + 1);
    }, [canvas, index]);

    const loadJSON = useCallback(async (json: string) => {
        if (!canvas) return;
        await canvas.loadFromJSON(json);
        canvas.renderAll();
        try {
            const parsed = JSON.parse(json);
            const bg = parsed.backgroundColor || parsed.background;
            if (bg && onBgFromJSON) onBgFromJSON(bg);
        } catch {
        }
    }, [canvas, onBgFromJSON]);

    const undo = useCallback(async () => {
        if (!canvas || !canUndo) return;
        const prev = history[index - 1];
        await loadJSON(prev);
        setIndex(i => i - 1);
    }, [canvas, canUndo, history, index, loadJSON]);

    const redo = useCallback(async () => {
        if (!canvas || !canRedo) return;
        const next = history[index + 1];
        await loadJSON(next);
        setIndex(i => i + 1);
    }, [canvas, canRedo, history, index, loadJSON]);

    const api = useMemo(() => ({
        snapshot, undo, redo, canUndo, canRedo, index, history
    }), [snapshot, undo, redo, canUndo, canRedo, index, history]);

    return api;
}
