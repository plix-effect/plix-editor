import React, {DragEvent, DragEventHandler, FC, memo, useCallback, useContext, useMemo} from "react";
import {EditorPath} from "../../../types/Editor";
import {ValueTrack} from "./ValueTrack";
import {getArrayKey} from "../../../utils/KeyManager";
import {TrackContext} from "../TrackContext";
import {DeleteAction, InsertValuesAction, MultiAction} from "../PlixEditorReducerActions";
import {Track} from "../../timeline/Track";
import "./ArrayElementsTrack.scss";
import {DragType} from "../DragContext";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface ArrayElementsTrackProps {
    value: any[],
    type: string,
    path: EditorPath,
    canDelete?: boolean
}
export const ArrayElementsTrack: FC<ArrayElementsTrackProps> = memo(({value, type, path, canDelete}) => {
    const {dispatch} = useContext(TrackContext);
    const valuesData = useMemo(() => {
        return value.map((val, i) => {
            const key = getArrayKey(value, i);
            const valPath: EditorPath = [...path, {key: String(key)}]
            return {
                elementPath: valPath,
                key: key,
                value: val,
                index: i,
            }
        });
    }, [value, dispatch]);

    return (
        <Track>
            {null}
            {null}
            {valuesData.map(({key, value, elementPath, index}) => (
                <ArrayElementTrack key={key} type={type} value={value} parentPath={path} path={elementPath} canDelete={canDelete} index={index} canInsert/>
            ))}
        </Track>
    );
});

interface ArrayElementTrackProps {
    type: string,
    value: any,
    parentPath: EditorPath,
    path: EditorPath,
    canDelete: boolean,
    canInsert: boolean,
    index: number,
}
const ArrayElementTrack:FC<ArrayElementTrackProps> = ({type, value, path, parentPath, canDelete, index, canInsert}) => {

    const {dispatch} = useContext(TrackContext);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        if (!canInsert || !dragData) return;
        let side: "top"|"bottom"|null = null;
        const offsetY = event.nativeEvent.offsetY;
        if (offsetY < 10) side = "top";
        if (!side) {
            const {height} = event.currentTarget.getBoundingClientRect();
            if (offsetY > height - 10) side = "bottom";
        }
        if (!side) return;
        let allowLink = dragData[type+"Link"] != null;

        let mode: "copy"|"move"|"link"|"none" = allowLink ? "link" : "none";
        if (event.ctrlKey && event.shiftKey) mode = allowLink ? "link" : "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (!allowLink) mode = dragData.deleteAction ? "move" : "copy";

        let insertValue;
        if (mode === "link" && allowLink) {
            insertValue = dragData[type+"Link"]
        }
        if (insertValue === undefined) {
            const baseValue = dragData[type];
            if (baseValue) insertValue = baseValue;
        }

        const typedValue = dragData.typedValue;
        if (insertValue === undefined && !typedValue) return;
        if (insertValue === undefined && typedValue.type === type) insertValue = typedValue.value;
        if (insertValue === undefined && typedValue.type === "array:"+type) insertValue = typedValue.value;
        if (insertValue === undefined) return;

        if (!mode) return;
        if (mode === "move" && insertValue !== value && isObjectEqualOrContains(insertValue, value)) {
            dragData.dropEffect = "none";
            return;
        }

        dragData.dropEffect = mode;

        return [`_drop-insert _drop-insert-${side}`, () => {
            let insertAction;
            let insertIndex = side === "top" ? index: index+1;
            if (typedValue.type === type) insertAction = InsertValuesAction(parentPath, insertIndex, [insertValue]);
            else insertAction = InsertValuesAction(parentPath, insertIndex, insertValue as any[])
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([insertAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(insertAction);
            }
            return;
        }];
    }, [path, dispatch]);

    const deleteAction = useMemo(() => {
        return canDelete ? DeleteAction(path) : undefined;
    }, [canDelete, path]);

    return (
        <ValueTrack type={type} value={value} path={path} deleteAction={deleteAction} onDragOverItem={onDragOverItemSelf}>
            <span title="[Alt + Click] = delete">[{index}]</span>
        </ValueTrack>
    )
}