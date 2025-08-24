import {ReactNode} from "react";

export function SidebarCard({
                                sectionKey,
                                activePanel,
                                setActivePanel,
                                icon,
                                title,
                                children,
                            }: {
    sectionKey: string;
    activePanel: string | null;
    setActivePanel: (panel: string | null) => void;
    icon: ReactNode;
    title: string;
    children: ReactNode;
}) {
    const active = activePanel === sectionKey;
    return (
        <div
            className={`relative rounded-lg border bg-card p-3 cursor-pointer transition-all hover:shadow-md ${
                active ? "ring-2 ring-primary border-primary" : ""
            }`}
            onClick={() => setActivePanel(active ? null : sectionKey)}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-medium">{title}</span>
            </div>

            {active && (
                <div
                    data-flyout="true"
                    className="fixed left-[15rem] top-40 w-80 bg-background border rounded-lg shadow-xl p-4 z-[60] max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
