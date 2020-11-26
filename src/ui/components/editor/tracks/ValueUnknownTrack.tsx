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
import {MultiActionType} from "../PlixEditorReducerActions";
import {TrackContext} from "../TrackContext";
import {DragType} from "../DragContext";

export interface ValueUnknownTrackProps {
    type: string,
    value: any,
    children: ReactNode
    path: EditorPath,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const ValueUnknownTrack: FC<ValueUnknownTrackProps> = memo(({type, value, children, path, deleteAction, clearAction, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: type, value: value},
            deleteAction: deleteAction
        }
    }, [type, value, deleteAction]);

    const onDragOverItemSelf = useMemo(() => {
        return createDefaultDragTypeBehavior(type, path, dispatch, onDragOverItem)
    }, [type, path, dispatch, onDragOverItem]);

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
                <span/>
            {/*    TODO*/}
            </TimelineBlock>
        </Track>
    );
});