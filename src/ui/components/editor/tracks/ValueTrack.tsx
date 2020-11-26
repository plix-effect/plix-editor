import React, {FC, memo, ReactNode, DragEvent, DragEventHandler} from "react";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ArrayTrack} from "./ArrayTrack";
import {EffectTrack} from "./EffectTrack";
import {ColorTrack} from "./ColorTrack";
import {NumberTrack} from "./NumberTrack";
import {MultiActionType} from "../PlixEditorReducerActions";
import {DragType} from "../DragContext";

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    description?: ReactNode
    path: EditorPath,
    clearAction?: MultiActionType
    deleteAction?: MultiActionType
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const ValueTrack: FC<ValueTrackProps> = memo(({type, value, description, children, path, deleteAction, clearAction, onDragOverItem}) => {

    if (type.startsWith("array:")) {
        return (
            <ArrayTrack path={path} value={value} type={type.substring(6)} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
                <span className="track-description _desc">{description}</span>
            </ArrayTrack>
        )
    }
    if (type === "filter") {
        return (
            <FilterTrack filter={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
            </FilterTrack>
        )
    }
    if (type === "effect") {
        return (
            <EffectTrack effect={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
            </EffectTrack>
        );
    }
    if (type === "color") {
        return (
            <ColorTrack value={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
            </ColorTrack>
        );
    }
    if (type === "number") {
        return (
            <NumberTrack value={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                <span>{children}</span>
            </NumberTrack>
        )
    }
    return (
        <ValueUnknownTrack type={type} value={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
            <span>{children}</span>
        </ValueUnknownTrack>
    )
});