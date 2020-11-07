import React, {
    FC,
    ReactNode,
    memo,
    useCallback,
    DragEvent,
    useRef,
    useEffect, TouchEvent
} from "react";
import "./SplitTopBottom.scss";

interface RowsDividerProps {
    minTop: number;
    minBottom: number;
    children: readonly [ReactNode, ReactNode],
    storageKey?: string;
}
export const SplitTopBottom: FC<RowsDividerProps> = memo((
    {
        children: [topElement, bottomElement],
        storageKey,
        minTop,
        minBottom
    },
) => {
    const containerRef = useRef<HTMLDivElement>();
    const topRef = useRef<HTMLDivElement>();
    const bottomRef = useRef<HTMLDivElement>();
    const dividerRef = useRef<HTMLAnchorElement>();
    const dragOffset = useRef<number>(0);

    const onDragStart = useCallback((event: DragEvent<HTMLAnchorElement>) => {
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        dragOffset.current = event.nativeEvent.offsetY;
    }, []);

    const saveValueToStorage = useCallback((value: number) => {
        if (!storageKey) return;
        localStorage.setItem("RowsDivider:"+storageKey, String(value));
    }, [storageKey]);

    const applyTopValue = useCallback((top: number) => {
        const containerBcr = containerRef.current.getBoundingClientRect();
        const dividerBcr = dividerRef.current.getBoundingClientRect();
        const fromBottomValue = containerBcr.height - top - dividerBcr.height;
        let topHeight = top;
        if (fromBottomValue < minBottom) topHeight = containerBcr.height - minBottom - dividerBcr.height;
        if (top < minTop) topHeight = minTop;
        topRef.current.style.height = topHeight+"px"
        bottomRef.current.style.height = containerBcr.height - dividerBcr.height - topHeight+"px"
        saveValueToStorage(topHeight);
        return true;
    }, []);

    const applyStorageValue = useCallback(() => {
        if (!storageKey) return;
        const storageValue = localStorage.getItem("RowsDivider:"+storageKey);
        if (storageValue == null) return;
        const value = Number(storageValue);
        if (isNaN(value)) return;
        applyTopValue(value);
    }, [storageKey, applyTopValue]);

    useEffect(() => {
        applyStorageValue();
    }, []);

    const onDrag = useCallback((event: DragEvent<HTMLAnchorElement>) => {
        if (event.clientY === 0) return;
        const containerBcr = containerRef.current.getBoundingClientRect();
        const top = event.clientY - containerBcr.top - dragOffset.current
        applyTopValue(top);
    }, []);

    const onTouchMove = useCallback(({changedTouches}: TouchEvent<HTMLAnchorElement>) => {
        const y = changedTouches.item(0)?.clientY;
        applyTopValue(y);
    }, [])

    useEffect(() => {
        function onResize(){
            const top = topRef.current.getBoundingClientRect().height;
            applyTopValue(top);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize)
    }, []);

    return (<>
    <div className="split-top-bottom-container" ref={containerRef}>
        <div className="split-top-bottom-container-top" ref={topRef}>
            {topElement}
        </div>
        <a
            className="split-top-bottom-container-drag"
            draggable
            onDrag={onDrag}
            onDragStart={onDragStart}
            onTouchMove={onTouchMove}
            ref={dividerRef}
        />
        <div className="split-top-bottom-container-bottom" ref={bottomRef}>
            {bottomElement}
        </div>
    </div>
    </>);
})