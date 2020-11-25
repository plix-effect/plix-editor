import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    MouseEvent,
    useCallback,
    useContext,
    useMemo,
    useRef
} from "react";
import {EditorPath} from "../../../types/Editor";
import {ValueTrack} from "./ValueTrack";
import {getArrayKey} from "../../../utils/KeyManager";
import {TrackContext} from "../TrackContext";
import {InsertValuesAction, MultiAction} from "../PlixEditorReducerActions";
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
            const valPath: EditorPath = [...path, {key: String(key), array: value}]
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
    const dropTargetTopRef = useRef<HTMLDivElement>();
    const dropTargetBottomRef = useRef<HTMLDivElement>();

    const setDropTargetVisible = useCallback((side: "top"|"bottom"|null) => {
        dropTargetTopRef.current.classList.toggle("_drop-target", side === "top");
        dropTargetBottomRef.current.classList.toggle("_drop-target", side === "bottom");
    }, []);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, value: DragType): void | DragEventHandler => {
        if (!canInsert || !value) return setDropTargetVisible(null);
        let side: "top"|"bottom"|null = null;
        const offsetY = event.nativeEvent.offsetY;
        if (offsetY < 10) side = "top";
        if (!side) {
            const {height} = event.currentTarget.getBoundingClientRect();
            if (offsetY > height - 10) side = "bottom";
        }
        if (!side) return setDropTargetVisible(null);
        let allowLink = value[type+"Link"] != null;

        let mode: "copy"|"move"|"link"|"none" = allowLink ? "link" : "none";
        if (event.ctrlKey && event.shiftKey) mode = allowLink ? "link" : "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = value.deleteAction ? "move" : "none";
        else if (!allowLink) mode = value.deleteAction ? "move" : "copy"

        let insertValue;
        if (mode === "link" && allowLink) {
            insertValue = value[type+"Link"]
        }
        if (!insertValue) {
            const baseValue = value[type];
            if (baseValue) insertValue = baseValue;
        }

        const typedValue = value.typedValue;
        if (!insertValue && !typedValue) return setDropTargetVisible(null);
        if (!insertValue && typedValue.type === type) insertValue = typedValue.value;
        if (!insertValue && typedValue.type === "array:"+type) insertValue = typedValue.value;
        if (!insertValue) return setDropTargetVisible(null);

        if (!mode) return setDropTargetVisible(null);
        if (mode === "move" && isObjectEqualOrContains(insertValue, value)) {
            value.dropEffect = "none";
            return setDropTargetVisible(null);
        }

        value.dropEffect = mode;
        setDropTargetVisible(side);

        return () => {
            let insertAction;
            let insertIndex = side === "top" ? index: index+1;
            if (typedValue.type === type) insertAction = InsertValuesAction(parentPath, insertIndex, [insertValue]);
            else insertAction = InsertValuesAction(parentPath, insertIndex, insertValue as any[])
            if (mode === "move" && value.deleteAction) {
                dispatch(MultiAction([insertAction, value.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(insertAction);
            }
            return setDropTargetVisible(null);
        };
    }, [path, dispatch]);


    return (
        <ValueTrack type={type} value={value} path={path} canDelete={canDelete} onDragOverItem={onDragOverItemSelf}>
            <span className="array-track-drop-target _top" ref={dropTargetTopRef}/>
            <span className="array-track-drop-target _bottom" ref={dropTargetBottomRef}/>
            <span title="[Alt + Click] = delete">[{index}]</span>
        </ValueTrack>
    )
}