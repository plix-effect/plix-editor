import React, {
    Dispatch,
    DragEvent,
    DragEventHandler,
    FC,
    MouseEventHandler, ReactNode,
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
    selected?: boolean,
    dragValue?: DragType,
    onClick?: MouseEventHandler<HTMLDivElement>,
    title?: string,
    right?: ReactNode,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value?: DragType) => void | [string,DragEventHandler]
}
export const TreeBlock: FC<TreeBlockProps> = (
    {
        children,
        selected = false,
        title,
        type = "default",
        dragValue,
        onClick,
        onDragOverItem,
        right
    }
) => {
    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const blockRef = useRef<HTMLDivElement>();
    const onDropActionRef = useRef<[string,DragEventHandler]>();

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
            const classesToRemove = onDropActionRef.current?.[0]?.split(" ") ?? []
            blockRef.current.classList.remove("_drop", ...classesToRemove);
        }
        if (dragRef.current) dragRef.current.dropEffect = null;
    }, [onDragOverItem]);

    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        const handler = onDragOverItem?.(event, dragRef.current);
        const classesToRemove = onDropActionRef.current?.[0]?.split(" ") ?? []
        blockRef.current.classList.remove("_drop", ...classesToRemove);
        if (!handler) return;
        event.dataTransfer.dropEffect = dragRef.current.dropEffect;
        event.preventDefault();
        onDropActionRef.current = handler;
        blockRef.current.classList.add("_drop", ...handler[0].split(" "));
    }, [onDragOverItem]);

    const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
        dragCount.current = 0;
        if (!onDropActionRef.current) return;
        const classesToRemove = onDropActionRef.current?.[0]?.split(" ") ?? []
        blockRef.current.classList.remove("_drop", ...classesToRemove);
        return onDropActionRef.current?.[1]?.(event);
    }, []);


    return (
        <div
            ref={blockRef}
            title={title}
            className={cn("track-tree-block", `_${type}`, {"_selected": selected})}
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
            <div className="track-tree-block-space"/>
            <div className="track-tree-block-right">
                {right}
                <div className="track-tree-drop-icon-content">
                    <i className="fa fa-edit track-tree-icon track-tree-icon-replace"/>
                    <i className="fa fa-plus track-tree-icon track-tree-icon-add-item"/>
                    <i className="fa fa-plus-square track-tree-icon track-tree-icon-add-array"/>
                </div>
            </div>

        </div>
    )
}

export function createDefaultDragTypeBehavior(
    dataType: string,
    path: EditorPath,
    dispatch: Dispatch<PlixEditorAction>,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value?: DragType) => void | [string, DragEventHandler],
): (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]{
    return (event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let mode: "copy"|"move"|"link"|"none" =  "none";
        if (event.ctrlKey && event.shiftKey) mode = "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else mode = "copy";
        if (mode === "none") return void (dragData.dropEffect = "none");

        const typedValue = dragData?.typedValue;
        if (!typedValue || typedValue.type !== dataType) return void (dragData.dropEffect = "none");
        const valueColor = typedValue?.value;
        if (!valueColor) return void (dragData.dropEffect = "none");

        dragData.dropEffect = mode;
        return ["_drop-replace", () => {
            const changeAction = EditValueAction(path, valueColor);
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([changeAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        }];
    }
}