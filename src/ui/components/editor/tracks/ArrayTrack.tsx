import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext,
    useMemo
} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {useExpander} from "../track-elements/Expander";
import {TrackContext} from "../TrackContext";
import {
    EditValueAction,
    InsertValuesAction,
    MultiAction,
    MultiActionType,
    PushValueAction
} from "../PlixEditorReducerActions";
import {ArrayElementsTrack} from "./ArrayElementsTrack";
import {DragType} from "../DragContext";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface ArrayTrackProps {
    value: any[],
    type: string,
    children: [name: ReactNode,desc: ReactNode]
    path: EditorPath,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
}
export const ArrayTrack: FC<ArrayTrackProps> = memo(({value, type, children: [name, desc], path, onDragOverItem, deleteAction, clearAction}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(false);
    const {dispatch} = useContext(TrackContext);

    const valueToPush = useMemo(() => {
        if (type.startsWith("array:")) return [];
        return defaultValuesMap[type];
    }, [type]);

    const push = useCallback(() => {
        dispatch(PushValueAction(path, valueToPush));
        setExpanded(true);
    }, [dispatch, path, valueToPush, setExpanded]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "array:"+type, value: value},
            deleteAction: deleteAction
        }
    }, [type, value, deleteAction]);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let allowLink = dragData[type+"Link"] != null;

        let mode: "copy"|"move"|"link"|"none" = allowLink ? "link" : "none";
        if (event.ctrlKey && event.shiftKey) mode = allowLink ? "link" : "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (!allowLink) mode = dragData.deleteAction ? "move" : "copy";

        if (mode === "none") return void (dragData.dropEffect = "none");

        let dragOverValue;
        let replaceArray = false;
        if (mode === "link" && allowLink) {
            dragOverValue = dragData[type+"Link"]
        }

        if (dragOverValue === undefined) {
            const baseValue = dragData[type];
            if (baseValue) dragOverValue = baseValue;
        }

        const typedValue = dragData.typedValue;
        if (dragOverValue === undefined && !typedValue) return void (dragData.dropEffect = "none");
        if (dragOverValue === undefined && typedValue.type === type) dragOverValue = typedValue.value;
        if (dragOverValue === undefined && typedValue.type === "array:"+type) {
            dragOverValue = typedValue.value;
            replaceArray = true;
        }
        if (dragOverValue === undefined) return;

        if (value === dragOverValue) return;
        if (mode === "move" && isObjectEqualOrContains(dragOverValue, value)) {
            return void (dragData.dropEffect = "none");
        }

        dragData.dropEffect = mode;

        return () => {
            let editAction;
            if (replaceArray) editAction = EditValueAction(path, dragOverValue);
            else editAction = InsertValuesAction(path, value.length, [dragOverValue]);
            console.log("InsertValuesAction", editAction, dragData);
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([editAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(editAction);
            }
            return void (dragData.dropEffect = "none");
        };
    }, [path, dispatch, onDragOverItem]);


    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (!event.ctrlKey && !event.altKey && event.shiftKey) {
            if (valueToPush !== undefined) push();
        }
        if (event.ctrlKey && event.altKey && !event.shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
    }, [deleteAction, dispatch, valueToPush, push]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock onDragOverItem={onDragOverItemSelf} dragValue={dragValue} onClick={onClick}>
                {expander}
                <span className="track-description">{name}</span>
                <span>{" "}</span>
                <span className="track-description _desc">({value.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                { valueToPush !== undefined && (<a onClick={push}>[add {type}]</a>)}
                &nbsp;
                <span className="track-description _desc">{desc}</span>
            </TimelineBlock>
            <ArrayElementsTrack value={value} type={type} path={path} canDelete/>
        </Track>
    );
})

const defaultValuesMap = {
    color: 0xFF00FF80,
    blender: "normal",
    effect: null,
    filter: null,
    gradient: [[0, [0,0,0,1]], [1, [0,0,1,0]]],
    number: 0,
    position: [[0,1], [2,3]],
    timing: ["linear", 1, 0],
}