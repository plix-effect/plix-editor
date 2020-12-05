import React, {
    ComponentType,
    DragEvent,
    DragEventHandler,
    PropsWithChildren,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext,
    useMemo, ReactElement,
} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {createDefaultDragTypeBehavior, TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {EditValueAction, MultiActionType} from "../PlixEditorReducerActions";
import {TrackContext} from "../TrackContext";
import {DragType} from "../DragContext";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";

export interface ValueWithEditorTrackProps<T,> {
    type: string,
    value: T,
    children: ReactNode
    path: EditorPath,
    title?: string,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
    EditorComponent: ComponentType<{value:T, onChange:(value: T) => void}>
}
export const ValueWithEditorTrack = <T,>(
    {type, title, value, children, path, deleteAction, clearAction, onDragOverItem, EditorComponent}: PropsWithChildren<ValueWithEditorTrackProps<T>>
): ReactElement => {
    const {dispatch} = useContext(TrackContext);
    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: type, value: value},
            deleteAction: deleteAction
        }
    }, [type, value, deleteAction]);

    const onDragOverItemSelf = useMemo(() => {
        return createDefaultDragTypeBehavior(type, path, dispatch, onDragOverItem)
    }, [type, path, dispatch, onDragOverItem]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, shiftKey, altKey}) => {
        if (!ctrlKey && altKey && !shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (ctrlKey && altKey && !shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction) dispatch(deleteAction);
    }, [deleteAction, clearAction, dispatch]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (clearAction) dispatch(clearAction);
    }, [deleteAction, clearAction, dispatch]);

    const rightIcons = (<>
        {(deleteAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
        {(clearAction) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>);

    return (
        <Track>
            <TreeBlock selected={selected} title={title} onDragOverItem={onDragOverItemSelf} onClick={onClick} dragValue={dragValue} right={rightIcons}>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                <EditorComponent value={value} onChange={onChange}/>
            </TimelineBlock>
        </Track>
    );
};