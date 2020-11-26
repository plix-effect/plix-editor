import React, {FC, memo, MouseEventHandler, ReactNode, useMemo, DragEvent, DragEventHandler} from "react";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ArrayTrack} from "./ArrayTrack";
import {EffectTrack} from "./EffectTrack";
import {ColorTrack} from "./ColorTrack";
import {NumberTrack} from "./NumberTrack";
import {DeleteAction} from "../PlixEditorReducerActions";
import {DragType} from "../DragContext";

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    description?: ReactNode
    path: EditorPath,
    canDelete?: boolean
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const ValueTrack: FC<ValueTrackProps> = memo(({type, value, description, children, path, canDelete, onDragOverItem}) => {

    const deleteAction = useMemo(() => {
        return canDelete ? DeleteAction(path) : undefined
    }, [canDelete]);

    if (type.startsWith("array:")) {
        return (
            <ArrayTrack path={path} value={value} type={type.substring(6)} onDragOverItem={onDragOverItem} deleteAction={deleteAction}>
                {children}
                <span className="track-description _desc">{description}</span>
            </ArrayTrack>
        )
    }
    if (type === "filter") {
        return (
            <FilterTrack filter={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction}>
                {children}
            </FilterTrack>
        )
    }
    if (type === "effect") {
        return (
            <EffectTrack effect={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction}>
                {children}
            </EffectTrack>
        );
    }
    if (type === "color") {
        return (
            <ColorTrack value={value} path={path}>
                {children}
            </ColorTrack>
        );
    }
    if (type === "number") {
        return (
            <NumberTrack value={value} path={path}>
                <span>{children}</span>
            </NumberTrack>
        )
    }
    return <ValueUnknownTrack value={value} path={path} >
        <span>{children}</span>
    </ValueUnknownTrack>
});