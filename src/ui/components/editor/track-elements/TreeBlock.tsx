import React, {
    Dispatch,
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
import {EditValueAction, MultiAction} from "../PlixEditorReducerActions";
import {EditorPath} from "../../../types/Editor";
import {PlixEditorAction} from "../PlixEditorReducer";

type TimelineBlockType = "default" | "description" | "timeline" | "title"
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
        if (dragRef.current) dragRef.current.dropEffect = null;
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

export function createDefaultDragTypeBehavior(
    dataType: string,
    path: EditorPath,
    dispatch: Dispatch<PlixEditorAction>,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value?: DragType) => void | DragEventHandler,
): (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler{
    return (event: DragEvent<HTMLElement>, dragData: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let mode: "copy"|"move"|"link"|"none" =  "none";
        if (event.ctrlKey && event.shiftKey) mode = "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else mode = dragData.deleteAction ? "move" : "copy";
        if (mode === "none") return void (dragData.dropEffect = "none");

        const typedValue = dragData?.typedValue;
        if (!typedValue || typedValue.type !== dataType) return void (dragData.dropEffect = "none");
        const valueColor = typedValue?.value;
        if (!valueColor) return void (dragData.dropEffect = "none");

        dragData.dropEffect = mode;
        return () => {
            const changeAction = EditValueAction(path, valueColor);
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([changeAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        };
    }
}