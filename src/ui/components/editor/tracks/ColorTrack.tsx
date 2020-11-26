import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext, useMemo
} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {createDefaultDragTypeBehavior, TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {parseColor} from "@plix-effect/core";
import {ColorView} from "../track-elements/ColorView";
import {TrackContext} from "../TrackContext";
import {EditValueAction, MultiAction, MultiActionType} from "../PlixEditorReducerActions";
import {InlineColorEditor} from "./editor/inline/InlineColorEditor";
import {DragType} from "../DragContext";

export interface ColorTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const ColorTrack: FC<ColorTrackProps> = memo(({value, children, path, deleteAction, clearAction, onDragOverItem}) => {
    const color = parseColor(value, null);
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (event.ctrlKey && event.altKey && !event.shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
    }, [deleteAction, dispatch]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "color", value: value},
            deleteAction: deleteAction
        }
    }, [value, deleteAction]);


    const onDragOverItemSelf = useMemo(() => {
        return createDefaultDragTypeBehavior("color", path, dispatch, onDragOverItem)
    }, [path, dispatch, onDragOverItem]);

    return (
        <Track>
            <TreeBlock onClick={onClick} onDragOverItem={onDragOverItemSelf} dragValue={dragValue} >
                {children} <ColorView background={true} color={color}/>
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineColorEditor color={value} onChange={onChange}/>
            </TimelineBlock>
        </Track>
    );
})