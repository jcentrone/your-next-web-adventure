// src/components/modals/KeyboardShortcutsModal.tsx
const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");

function Keys({parts}: { parts: string[] }) {
    return (
        <div className="flex flex-wrap gap-1 justify-end">
            {parts.map((p, i) => (
                <kbd
                    key={i}
                    className="px-1.5 py-0.5 rounded-md border text-xs leading-relaxed bg-white/70 shadow-sm"
                >
                    {p}
                </kbd>
            ))}
        </div>
    );
}

type Row = { keys: string[]; label: string };
type Group = { title: string; rows: Row[] };

const groups: Group[] = [
    {title: "File", rows: [{keys: [isMac ? "⌘" : "Ctrl", "S"], label: "Save"}]},
    {
        title: "Edit",
        rows: [
            {keys: [isMac ? "⌘" : "Ctrl", "Z"], label: "Undo"},
            {keys: [isMac ? "⌘" : "Ctrl", "Shift", "Z"], label: "Redo"},
            {keys: [isMac ? "⌘" : "Ctrl", "Y"], label: "Redo (alt)"},
            {keys: ["Delete"], label: "Delete selection"},
            {keys: [isMac ? "⌘" : "Ctrl", "C"], label: "Copy"},
            {keys: [isMac ? "⌘" : "Ctrl", "V"], label: "Paste / Duplicate"},
            {keys: [isMac ? "⌘" : "Ctrl", "D"], label: "Duplicate"},
            {keys: [isMac ? "⌘" : "Ctrl", "A"], label: "Select all"},
        ],
    },
    {
        title: "Arrange",
        rows: [
            {keys: [isMac ? "⌘" : "Ctrl", "G"], label: "Group"},
            {keys: [isMac ? "⌘" : "Ctrl", "Shift", "G"], label: "Ungroup"},
            {keys: ["]"], label: "Bring forward"},
            {keys: ["["], label: "Send backward"},
        ],
    },
    {
        title: "View",
        rows: [
            {keys: [isMac ? "⌘" : "Ctrl", "+"], label: "Zoom in"},
            {keys: [isMac ? "⌘" : "Ctrl", "-"], label: "Zoom out"},
            {keys: [isMac ? "⌘" : "Ctrl", "0"], label: "Reset zoom"},
        ],
    },
    {
        title: "Move",
        rows: [
            {keys: ["↑", "↓", "←", "→"], label: "Nudge 1px"},
            {keys: ["Shift", "↑/↓/←/→"], label: "Nudge 10px"},
        ],
    },
    {title: "Misc", rows: [{keys: ["Esc"], label: "Close panel / clear selection"}]},
];

export function KeyboardShortcutsModal({
                                           open,
                                           onClose,
                                       }: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden/>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                        <button
                            onClick={onClose}
                            className="rounded p-1 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="p-4 sm:p-6 overflow-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {groups.map((g) => (
                                <div key={g.title}>
                                    <h3 className="text-xs font-medium text-gray-600 mb-2">{g.title}</h3>
                                    <ul className="space-y-1.5">
                                        {g.rows.map((r, i) => (
                                            <li key={i} className="flex items-center justify-between gap-3">
                                                <span className="text-sm text-gray-800">{r.label}</span>
                                                <Keys parts={r.keys}/>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t text-xs sm:text-sm text-gray-600">
                        Tip: Hold <strong>Shift</strong> while nudging to move faster.
                    </div>
                </div>
            </div>
        </div>
    );
}
