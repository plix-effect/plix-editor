import React, {FC, memo, ReactNode, DragEvent, DragEventHandler, ComponentType} from "react";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ArrayTrack} from "./ArrayTrack";
import {EffectTrack} from "./EffectTrack";
import {MultiActionType} from "../PlixEditorReducerActions";
import {DragType} from "../DragContext";
import {ValueWithEditorTrack} from "./ValueWithEditorTrack";
import {InlineNumberEditor} from "./editor/inline/InlineNumberEditor";
import {InlineBlenderEditor} from "./editor/inline/InlineBlenderEditor";
import {InlineJsonEditor} from "./editor/inline/InlineJsonEditor";
import {InlineColorEditor} from "./editor/inline/InlineColorEditor";
import {InlineGridEditor} from "./editor/inline/InlineGridEditor";
import {PreviewFieldEditor} from "./editor/preview-field/PreviewFieldEditor";
import {GradientEditor} from "./editor/gradient-editor/GradientEditor";

const defaultInlineEditors: {[key: string]: ComponentType<{value:any, onChange:(value:any) => void}>} = {
    color: InlineColorEditor,
    number: InlineNumberEditor,
    blend: InlineBlenderEditor,
    grid: InlineGridEditor,
    gradient: GradientEditor,
    fieldConfig: PreviewFieldEditor,
}

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    description?: ReactNode
    path: EditorPath,
    title?: string
    clearAction?: MultiActionType
    deleteAction?: MultiActionType
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const ValueTrack: FC<ValueTrackProps> = memo(({type, title, value, description, children, path, deleteAction, clearAction, onDragOverItem}) => {

    if (type.startsWith("array:")) {
        return (
            <ArrayTrack title={title} path={path} value={value} type={type.substring(6)} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
                <span className="track-description _desc">{description}</span>
            </ArrayTrack>
        )
    }
    if (type === "filter") {
        return (
            <FilterTrack title={title} filter={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
            </FilterTrack>
        )
    }
    if (type === "effect") {
        return (
            <EffectTrack title={title} effect={value} path={path} onDragOverItem={onDragOverItem} deleteAction={deleteAction} clearAction={clearAction}>
                {children}
            </EffectTrack>
        );
    }
    const ValueEditor = defaultInlineEditors[type];
    if (ValueEditor) {
        return (
            <ValueWithEditorTrack
                type={type}
                title={title}
                value={value}
                path={path}
                onDragOverItem={onDragOverItem}
                deleteAction={deleteAction}
                clearAction={clearAction}
                EditorComponent={ValueEditor}
            >
                <span>{children}</span>
            </ValueWithEditorTrack>
        );
    }
    return (
        <ValueWithEditorTrack
            type={type}
            title={title}
            value={value}
            path={path}
            onDragOverItem={onDragOverItem}
            deleteAction={deleteAction}
            clearAction={clearAction}
            EditorComponent={InlineJsonEditor}
        >
            <span>{children}</span>
        </ValueWithEditorTrack>
    );
});