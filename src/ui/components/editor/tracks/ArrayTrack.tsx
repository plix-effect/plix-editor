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
import {useSelectionControl, useSelectionPath} from "../SelectionContext";

export interface ArrayTrackProps {
    value: any[],
    type: string,
    children: [name: ReactNode,desc: ReactNode]
    path: EditorPath,
    title?: string,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler],
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
}
export const ArrayTrack: FC<ArrayTrackProps> = memo(({value, title, type, children: [name, desc], path, onDragOverItem, deleteAction, clearAction}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(false);
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

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

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let allowLink = dragData[type+"Link"] != null;

        let mode: "copy"|"move"|"link"|"none" = "copy";
        if (event.ctrlKey && event.shiftKey) mode = allowLink ? "link" : "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";

        if (mode === "none") return void (dragData.dropEffect = "none");

        let dragOverValue;
        let pushMode: "add-item"|"replace"|"add-array" = "add-item";
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
            pushMode = event.altKey ? "add-array" : "replace";
        }
        if (dragOverValue === undefined) return;

        if (value === dragOverValue && mode === "move" && pushMode === "replace") return;
        if (mode === "move" && isObjectEqualOrContains(dragOverValue, value)) {
            return void (dragData.dropEffect = "none");
        }

        dragData.dropEffect = mode;

        return [`_drop-${pushMode}`, () => {
            let editAction;
            if (pushMode === "replace") editAction = EditValueAction(path, dragOverValue);
            else if (pushMode === "add-array") editAction = InsertValuesAction(path, value.length, dragOverValue);
            else editAction = InsertValuesAction(path, value.length, [dragOverValue]);
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([editAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(editAction);
            }
        }];
    }, [path, dispatch, onDragOverItem]);


    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, shiftKey, altKey}) => {
        if (!ctrlKey && altKey && !shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (!ctrlKey && !altKey && shiftKey) {
            if (valueToPush !== undefined) push();
        }
        if (ctrlKey && altKey && !shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, valueToPush, push, path]);

    const onDblClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded();
    }, [changeExpanded]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction) dispatch(deleteAction);
    }, [deleteAction, dispatch]);

    const onClickAdd: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (valueToPush !== undefined) push();
    }, [push]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (clearAction) dispatch(clearAction);
    }, [clearAction, dispatch]);

    const rightIcons = (<>
        {valueToPush !== undefined && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title={`add ${type}`}/>
        )}
        {(deleteAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
        {(clearAction) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>)

    return (
        <Track nested expanded={expanded}>
            <TreeBlock selected={selected} onDragOverItem={onDragOverItemSelf} dragValue={dragValue} onClick={onClick} onDoubleClick={onDblClick} right={rightIcons} title={title}>
                {expander}
                <span className="track-description">{name}</span>
                <span>{" "}</span>
                <span className="track-description _desc">({value.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">{desc}</span>
            </TimelineBlock>
            <ArrayElementsTrack value={value} type={type} path={path} canDelete/>
        </Track>
    );
});

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