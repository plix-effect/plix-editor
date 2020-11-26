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
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {parseColor} from "@plix-effect/core";
import {ColorView} from "../track-elements/ColorView";
import {TrackContext} from "../TrackContext";
import {EditValueAction, MultiAction, MultiActionType} from "../PlixEditorReducerActions";
import {InlineColorEditor} from "./editor/inline/InlineColorEditor";
import {DragType} from "../DragContext";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface ColorTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath,
    deleteAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const ColorTrack: FC<ColorTrackProps> = memo(({value, children, path, deleteAction, onDragOverItem}) => {
    const color = parseColor(value, null);
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (event.altKey && deleteAction) dispatch(deleteAction);
    }, [deleteAction, dispatch]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "color", value: value},
            deleteAction: deleteAction
        }
    }, [value, deleteAction]);


    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let mode: "copy"|"move"|"link"|"none" =  "none";
        if (event.ctrlKey && event.shiftKey) mode = "none";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else mode = dragData.deleteAction ? "move" : "copy";

        if (mode === "none") return void (dragData.dropEffect = "none");

        const typedValue = dragData?.typedValue;
        if (!typedValue || typedValue.type !== "color") return void (dragData.dropEffect = "none");
        const valueColor = typedValue?.value;
        if (!valueColor) return void (dragData.dropEffect = "none");

        return () => {
            const changeAction = EditValueAction(path, valueColor);
            if (mode === "move" && value.deleteAction) {
                dispatch(MultiAction([changeAction, value.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        };
    }, [onDragOverItem, path, dispatch]);


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