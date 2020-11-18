import React, {
    FC,
    ReactNode,
    memo,
    useCallback,
    DragEvent,
    TouchEvent,
    useRef,
    useEffect,
    forwardRef
} from "react";
import "./SplitTimeline.scss";

const emptyImage = new Image();

interface SplitTimelineProps {
    minLeft: number;
    minRight: number;
    children: readonly [ReactNode, ReactNode, ReactNode, ReactNode],
    storageKey?: string;
}
export const SplitTimeline = memo(forwardRef<HTMLDivElement, SplitTimelineProps>((
    {
        children: [leftHeader, rightHeader, leftPanel, rightPanel],
        storageKey,
        minLeft,
        minRight
    },
    fRef
) => {

    const innerRef = useRef<HTMLDivElement>();
    const menuRef = useRef<HTMLDivElement>();
    const scaleRef = useRef<HTMLDivElement>();
    const treeRef = useRef<HTMLDivElement>();
    const timelineRef = useRef<HTMLDivElement>();
    const dragRef = useRef<HTMLAnchorElement>();
    const dragOffset = useRef<number>(0);

    const onScrollTimeline = useCallback(() => {
        scaleRef.current.scrollLeft = timelineRef.current.scrollLeft
        treeRef.current.scrollTop = timelineRef.current.scrollTop
    }, []);

    const onScrollTree = useCallback(() => {
        timelineRef.current.scrollTop = treeRef.current.scrollTop
    }, []);

    const onScrollScale = useCallback(() => {
        timelineRef.current.scrollLeft = scaleRef.current.scrollLeft
    }, []);

    const onDragStart = useCallback((event: DragEvent<HTMLAnchorElement>) => {
        dragOffset.current = event.nativeEvent.offsetX;
        event.dataTransfer.setDragImage(emptyImage, 0, 0);
    }, []);

    const saveValueToStorage = useCallback((value: number) => {
        if (!storageKey) return;
        localStorage.setItem("SplitTimeline:"+storageKey, String(value));
    }, [storageKey]);

    const applyDragValue = useCallback((dragValue: number) => {
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dividerBcr = dragRef.current.getBoundingClientRect();
        let leftWidth = dragValue;
        const rightPartWidth = containerBcr.width - dragValue - dividerBcr.width;
        if (rightPartWidth < minLeft) leftWidth = containerBcr.width - minRight - dividerBcr.width;
        if (dragValue < minLeft) leftWidth = minLeft;
        menuRef.current.style.width = leftWidth+"px";
        treeRef.current.style.width = leftWidth+"px";
        saveValueToStorage(leftWidth);
        return true;
    }, []);

    const onDrag = useCallback(({clientX}: DragEvent<HTMLAnchorElement>) => {
        if (clientX === 0) return;
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dragValue = clientX - containerBcr.left - dragOffset.current
        applyDragValue(dragValue);
    }, []);

    const onTouchMove = useCallback(({changedTouches}: TouchEvent<HTMLAnchorElement>) => {
        const containerBcr = innerRef.current.getBoundingClientRect();
        const dragBcr = dragRef.current.getBoundingClientRect();
        const x = changedTouches.item(0)?.clientX - containerBcr.left - dragBcr.width/2;
        applyDragValue(x);
    }, []);

    const applyStorageValue = useCallback(() => {
        if (!storageKey) return;
        const storageValue = localStorage.getItem("SplitTimeline:"+storageKey);
        if (storageValue == null) return;
        const value = Number(storageValue);
        if (isNaN(value)) return;
        applyDragValue(value);
    }, [storageKey, applyDragValue]);

    useEffect(() => {
        applyStorageValue();
    }, []);

    return (
        <div className="split-tl" ref={innerRef}>
            <div className="split-tl-menu hide-scroll" ref={menuRef}>
                <div className="split-tl-content">{leftHeader}</div>
            </div>
            <div className="split-tl-scale hide-scroll" ref={scaleRef} onScroll={onScrollScale}>
                <div className="split-tl-content">{rightHeader}</div>
            </div>
            <div className="split-tl-tree hide-scroll" ref={treeRef} onScroll={onScrollTree}>
                <div className="split-tl-content">{leftPanel}</div>
            </div>
            <div className="split-tl-timeline hide-scroll" ref={mergeRefs(fRef, timelineRef)} onScroll={onScrollTimeline}>
                <div className="split-tl-content">{rightPanel}</div>
            </div>
            <a className="split-tl-sep" ref={dragRef} draggable onDragStart={onDragStart} onDrag={onDrag} onTouchMove={onTouchMove}/>
        </div>
    );
}))

const mergeRefs = (...refs) => {
    const filteredRefs = refs.filter(Boolean);
    if (!filteredRefs.length) return null;
    if (filteredRefs.length === 0) return filteredRefs[0];
    return inst => {
        for (const ref of filteredRefs) {
            if (typeof ref === 'function') {
                ref(inst);
            } else if (ref) {
                ref.current = inst;
            }
        }
    };
};