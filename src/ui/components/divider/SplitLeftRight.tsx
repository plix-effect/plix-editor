import React, {
    FC,
    ReactNode,
    memo,
    useCallback,
    DragEvent,
    TouchEvent,
    useRef,
    useEffect
} from "react";
import "./SplitLeftRight.scss";

const emptyImage = new Image();

interface LeftPanelDividerProps {
    minLeft: number;
    minRight: number;
    children: readonly [ReactNode, ReactNode],
    storageKey?: string;
}
export const SplitLeftRight: FC<LeftPanelDividerProps> = memo((
    {
        children: [leftElement, rightElement],
        storageKey,
        minLeft,
        minRight
    },
) => {
    const innerRef = useRef<HTMLDivElement>();
    const leftRef = useRef<HTMLDivElement>();
    const rightRef = useRef<HTMLDivElement>();
    const dragRef = useRef<HTMLAnchorElement>();
    const dragOffset = useRef<number>(0);

    const saveValueToStorage = useCallback((value: number) => {
        if (!storageKey) return;
        localStorage.setItem("SplitLeftRight:"+storageKey, String(value));
    }, [storageKey]);

    const applyDragValue = useCallback((dragValue: number) => {
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dividerBcr = dragRef.current.getBoundingClientRect();
        let leftWidth = dragValue;
        const rightPartWidth = containerBcr.width - dragValue - dividerBcr.width;
        if (rightPartWidth < minLeft) leftWidth = containerBcr.width - minRight - dividerBcr.width;
        if (dragValue < minLeft) leftWidth = minLeft;
        leftRef.current.style.width = leftWidth+"px";
        dragRef.current.style.left = leftWidth+"px";
        saveValueToStorage(leftWidth);
        return true;
    }, []);

    const onDragStart = useCallback((event: DragEvent<HTMLAnchorElement>) => {
        dragOffset.current = event.nativeEvent.offsetX;
        event.dataTransfer.setDragImage(emptyImage, 0, 0);
    }, []);

    const onDrag = useCallback(({clientX}: DragEvent<HTMLAnchorElement>) => {
        if (clientX === 0) return;
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dragValue = clientX - containerBcr.left - dragOffset.current
        applyDragValue(dragValue);
        localStorage.setItem("RowsDivider:"+storageKey, String(dragValue));
    }, []);

    const onTouchMove = useCallback(({changedTouches}: TouchEvent<HTMLAnchorElement>) => {
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dragBcr = dragRef.current.getBoundingClientRect();
        const x = changedTouches.item(0)?.clientX - containerBcr.left - dragBcr.width/2;
        applyDragValue(x);
    }, [])

    const applyStorageValue = useCallback(() => {
        if (!storageKey) return;
        const storageValue = localStorage.getItem("RowsDivider:"+storageKey);
        if (storageValue == null) return;
        const value = Number(storageValue);
        if (isNaN(value)) return;
        applyDragValue(value);
    }, [storageKey, applyDragValue]);

    useEffect(() => {
        applyStorageValue();
    }, []);

    useEffect(() => {
        function onResize(){
            const value = leftRef.current.getBoundingClientRect().width;
            applyDragValue(value);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize)
    }, []);

    return (
        <div className="split-lr">
            <div className="split-lr-scroll-box" ref={innerRef}>
                <div className="split-lr-left" ref={leftRef}>
                    <div className="split-lr-left-content">
                        {leftElement}
                    </div>
                </div>
                <div className="split-lr-cnt" ref={rightRef}>
                    <div className="split-lr-timeline">
                        {rightElement}
                    </div>
                </div>
            </div>
            <a className="split-lr-drag" draggable="true" ref={dragRef} onDragStart={onDragStart} onDrag={onDrag} onTouchMove={onTouchMove} />
        </div>
    );
})