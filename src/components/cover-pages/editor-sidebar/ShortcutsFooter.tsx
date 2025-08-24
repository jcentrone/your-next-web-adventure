import {Keyboard as KeyboardIcon} from "lucide-react";

const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");

export function ShortcutsFooter({
                                    onShowShortcuts,
                                }: {
    onShowShortcuts?: () => void;
}) {
    return (
        <div className="absolute inset-x-0 bottom-0 bg-background border-t p-3">
            <button
                type="button"
                onClick={() => onShowShortcuts?.()}
                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
                <KeyboardIcon className="h-4 w-4 opacity-80"/>
                <span>Keyboard shortcuts</span>
                <span className="ml-auto text-gray-500">{isMac ? "⌘ + /" : "Ctrl + /"}</span>
            </button>
        </div>
    );
}
