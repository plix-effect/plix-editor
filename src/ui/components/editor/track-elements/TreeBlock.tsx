import React, {
    DragEvent,
    DragEventHandler,
    FC,
    MouseEventHandler,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from "react";
import cn from "classnames"
import "./TreeBlock.scss"
import {DragContext, DragType} from "../DragContext";

type TimelineBlockType = "default" | "description" | "timeline"
export interface TreeBlockProps {
    type?: TimelineBlockType
    dragValue?: DragType,
    onClick?: MouseEventHandler<HTMLDivElement>,
    title?: string,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value?: DragType) => void | DragEventHandler
}
export const TreeBlock: FC<TreeBlockProps> = (
    {
        children,
        title,
        type = "default",
        dragValue,
        onClick,
        onDragOverItem
    }
) => {
    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const blockRef = useRef<HTMLDivElement>();
    const onDropActionRef = useRef<DragEventHandler>();

    const onDragStart: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            ...dragValue,
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        blockRef.current.classList.add("_drag");
        event.stopPropagation();
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }, [dragValue, blockRef]);

    const onDrag = useCallback(() => {
        const dropEffect = dragRef.current?.dropEffect
        blockRef.current.classList.remove("_move", "_copy", "_link", "_none");
        if (dropEffect) blockRef.current.classList.add(`_${dropEffect}`);
    }, [dragRef, blockRef]);

    const onDragEnd: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        blockRef.current.classList.remove("_drag","_move", "_copy", "_link", "_none");
    }, [dragValue, blockRef]);

    const onDragEnter = useCallback(() => {
        dragCount.current++;
    }, []);

    const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
        dragCount.current--;
        if (dragCount.current === 0) {
            onDragOverItem?.(event);
        }
        dragRef.current.dropEffect = null;
    }, [onDragOverItem]);

    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        const handler = onDragOverItem?.(event, dragRef.current);
        if (!handler) return;
        event.dataTransfer.dropEffect = dragRef.current.dropEffect;
        event.preventDefault();
        onDropActionRef.current = handler;
    }, [onDragOverItem]);

    const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
        dragCount.current = 0;
        return onDropActionRef.current?.(event);
    }, []);


    return (
        <div
            ref={blockRef}
            title={title}
            className={cn("track-tree-block", `_${type}`)}
            draggable={dragValue != null}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrag={onDrag}
            onClick={onClick}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {children}
        </div>
    )
}