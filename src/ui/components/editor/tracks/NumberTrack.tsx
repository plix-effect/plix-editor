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
import {createDefaultDragTypeBehavior, TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {EditValueAction, MultiActionType} from "../PlixEditorReducerActions";
import {TrackContext} from "../TrackContext";
import {InlineJsonEditor} from "./editor/inline/InlineJsonEditor";
import {DragType} from "../DragContext";

export interface ValueUnknownTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath,
    clearAction?: MultiActionType,
    deleteAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const NumberTrack: FC<ValueUnknownTrackProps> = memo(({value, children, path, deleteAction, clearAction, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "number", value: value},
            deleteAction: deleteAction
        }
    }, [value, deleteAction]);

    const onDragOverItemSelf = useMemo(() => {
        return createDefaultDragTypeBehavior("number", path, dispatch, onDragOverItem)
    }, [path, dispatch, onDragOverItem]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (event.ctrlKey && event.altKey && !event.shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
    }, [deleteAction, dispatch]);

    return (
        <Track>
            <TreeBlock onDragOverItem={onDragOverItemSelf} onClick={onClick} dragValue={dragValue}>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineJsonEditor inputType={"number"} value={value} onChange={onChange} />
            </TimelineBlock>
        </Track>
    );
});