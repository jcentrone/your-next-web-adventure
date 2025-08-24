import {useEffect, useState} from "react";

export function useFlyoutPad(
    wrapperRef: React.RefObject<HTMLElement>,
    activePanel: string | null
) {
    const [pad, setPad] = useState(0);

    useEffect(() => {
        if (!activePanel) {
            setPad(0);
            return;
        }

        const wrapper = wrapperRef.current;
        const flyout = document.querySelector('[data-flyout="true"]') as HTMLElement | null;
        if (!wrapper || !flyout) return;

        const compute = () => {
            const w = wrapper.getBoundingClientRect();
            const f = flyout.getBoundingClientRect();
            setPad(Math.max(0, f.right - w.left));
        };

        compute();

        const ro = new ResizeObserver(compute);
        ro.observe(wrapper);
        ro.observe(flyout);

        const mo = new MutationObserver(compute);
        mo.observe(flyout, {attributes: true, childList: true, subtree: true});

        window.addEventListener("resize", compute);
        window.addEventListener("scroll", compute, true);

        return () => {
            ro.disconnect();
            mo.disconnect();
            window.removeEventListener("resize", compute);
            window.removeEventListener("scroll", compute, true);
        };
    }, [wrapperRef, activePanel]);

    return pad;
}
