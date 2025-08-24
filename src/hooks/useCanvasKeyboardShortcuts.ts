import {useEffect, useRef} from "react";
import type {Canvas as FabricCanvas, FabricObject, Textbox as FabricTextbox} from "fabric";
import {ActiveSelection, Textbox} from "fabric";

type Args = {
    canvas: FabricCanvas | null;
    onUndo: () => void;
    onRedo: () => void;
    onCopy: () => void;
    onDelete: () => void;
    onGroup: () => void;
    onUngroup: () => void;

    onZoomIn: () => void;
    onZoomOut: () => void;
    setZoom: (z: number | ((prev: number) => number)) => void;

    onSave?: () => void;
    onEscape?: () => void;

    nudgeStep?: number;
    nudgeStepBig?: number;

    onBringForward?: (obj: FabricObject) => void;
    onSendBackward?: (obj: FabricObject) => void;
    gridSize?: number;
};

function isTypingTarget(el: EventTarget | null) {
    const node = el as HTMLElement | null;
    if (!node) return false;
    const tag = node.tagName?.toLowerCase();
    return node.isContentEditable || tag === "input" || tag === "textarea" || tag === "select";
}

export function useCanvasKeyboardShortcuts({
                                               canvas,
                                               onUndo,
                                               onRedo,
                                               onCopy,
                                               onDelete,
                                               onGroup,
                                               onUngroup,
                                               onZoomIn,
                                               onZoomOut,
                                               setZoom,
                                               onSave,
                                               onEscape,
                                               nudgeStep = 1,
                                               nudgeStepBig = 10,
                                               onBringForward,
                                               onSendBackward,
                                           }: Args) {
    const clipboardRef = useRef<FabricObject[] | null>(null);

    useEffect(() => {
        if (!canvas) return;

        const handler = async (e: KeyboardEvent) => {
            // don’t hijack typing in inputs or while editing a Fabric Textbox
            if (isTypingTarget(e.target)) return;

            const active = canvas.getActiveObject() as FabricTextbox | FabricObject | null;
            if (active instanceof Textbox && active.isEditing) {
                // allow Esc to exit text edit mode explicitly
                if (e.key === "Escape") {
                    e.preventDefault();
                    (active as FabricTextbox).exitEditing();
                    canvas.requestRenderAll();
                }
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;
            const key = e.key;

            // Save
            if (ctrl && key.toLowerCase() === "s") {
                e.preventDefault();
                onSave?.();
                return;
            }

            // Undo / Redo
            if (ctrl && key.toLowerCase() === "z" && !e.shiftKey) {
                e.preventDefault();
                onUndo();
                return;
            }
            if ((ctrl && e.shiftKey && key.toLowerCase() === "z") || (ctrl && key.toLowerCase() === "y")) {
                e.preventDefault();
                onRedo();
                return;
            }

            // Zoom (includes numpad)
            if (ctrl && (key === "+" || key === "=" || e.code === "NumpadAdd")) {
                e.preventDefault();
                onZoomIn();
                return;
            }
            if (ctrl && (key === "-" || e.code === "NumpadSubtract")) {
                e.preventDefault();
                onZoomOut();
                return;
            }
            if (ctrl && key === "0") {
                e.preventDefault();
                setZoom(1);
                return;
            }

            // Copy (store into clipboardRef)
            if (ctrl && key.toLowerCase() === "c") {
                e.preventDefault();
                const objs = canvas.getActiveObjects();
                clipboardRef.current = objs.length ? objs : null;
                onCopy(); // your copy duplicates with an offset – still fine
                return;
            }

            // Paste / Duplicate
            if (ctrl && (key.toLowerCase() === "v" || key.toLowerCase() === "d")) {
                e.preventDefault();
                const current = canvas.getActiveObjects();
                if (current.length) {
                    onCopy(); // duplicate current selection
                } else if (clipboardRef.current?.length) {
                    // paste last copied selection even if nothing selected
                    const src = clipboardRef.current;
                    const clones = await Promise.all(
                        src.map(
                            (o) =>
                                new Promise<FabricObject>((resolve) => {
                                    o.clone((cl) => resolve(cl));
                                })
                        )
                    );
                    clones.forEach((cl) => {
                        cl.set({
                            left: (cl.left || 0) + 10,
                            top: (cl.top || 0) + 10,
                        });
                        canvas.add(cl);
                    });
                    if (clones.length === 1) {
                        canvas.setActiveObject(clones[0]);
                    } else {
                        const sel = new ActiveSelection(clones, {canvas});
                        canvas.setActiveObject(sel);
                    }
                    canvas.requestRenderAll();
                    // rely on your canvas "object:modified" history hook or call it directly if you expose one
                    canvas.fire("object:modified", {target: clones[0]});
                }
                return;
            }

            // Delete
            if (key === "Delete" || key === "Backspace") {
                const hasSelection = canvas.getActiveObjects().length > 0;
                if (hasSelection) {
                    e.preventDefault();
                    onDelete();
                }
                return;
            }

            // Select all
            if (ctrl && key.toLowerCase() === "a") {
                e.preventDefault();
                const selectable = canvas.getObjects().filter((o) => o.selectable !== false);
                if (selectable.length) {
                    const sel = new ActiveSelection(selectable, {canvas});
                    canvas.setActiveObject(sel);
                    canvas.requestRenderAll();
                }
                return;
            }

            // Group / Ungroup
            if (ctrl && key.toLowerCase() === "g" && !e.shiftKey) {
                e.preventDefault();
                onGroup();
                return;
            }
            if (ctrl && key.toLowerCase() === "g" && e.shiftKey) {
                e.preventDefault();
                onUngroup();
                return;
            }

            // Layers
            if (key === "]") {
                const objs = canvas.getActiveObjects();
                if (objs.length && onBringForward) {
                    e.preventDefault();
                    objs.forEach((o) => onBringForward(o));
                    canvas.requestRenderAll();
                }
                return;
            }
            if (key === "[") {
                const objs = canvas.getActiveObjects();
                if (objs.length && onSendBackward) {
                    e.preventDefault();
                    objs.forEach((o) => onSendBackward(o));
                    canvas.requestRenderAll();
                }
                return;
            }

            // Nudge with arrows (Shift = big step)
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
                const objs = canvas.getActiveObjects();
                if (!objs.length) return;
                e.preventDefault();
                const step = e.shiftKey ? nudgeStepBig : nudgeStep;
                const dx = key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0;
                const dy = key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0;

                objs.forEach((o) => {
                    o.set({
                        left: (o.left || 0) + dx,
                        top: (o.top || 0) + dy,
                    });
                    o.setCoords();
                });
                canvas.requestRenderAll();
                canvas.fire("object:modified", {target: objs[0]});
                return;
            }

            // Escape
            if (key === "Escape") {
                e.preventDefault();
                if (onEscape) {
                    onEscape();
                } else {
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                }
            }
        };

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [
        canvas,
        onUndo,
        onRedo,
        onCopy,
        onDelete,
        onGroup,
        onUngroup,
        onZoomIn,
        onZoomOut,
        setZoom,
        onSave,
        onEscape,
        nudgeStep,
        nudgeStepBig,
        onBringForward,
        onSendBackward,
    ]);
}
