import React, {
    DragEventHandler,
    FC,
    memo,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    DragEvent,
    Dispatch, SetStateAction
} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {EditValueAction, MultiActionType, PushValueAction} from "../../PlixEditorReducerActions";
import {TreeBlock} from "../../track-elements/TreeBlock";
import {DragType} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {EditorPath} from "../../../../types/Editor";
import {DisplayEffect} from "./DisplayEffect";

export interface TreeBlockEffectProps {
    effect: PlixEffectJsonData,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    setExpanded: Dispatch<SetStateAction<boolean>>,
    expander: ReactNode,
    changeExpanded: () => void,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const TreeBlockEffect: FC<TreeBlockEffectProps> = memo(({dragValue, effect, path, deleteAction, setExpanded, clearAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const effectIsChain = effect && effect[1] === "Chain";

    const title: string|undefined = useMemo(() => {
        if (!deleteAction && !dragValue) return undefined;
        let title = "Ctrl + Click = disable\n"
        if (deleteAction) title += "Alt + Click = delete\n";
        if (effectIsChain) title += "Shift + Click = add effect\n";
        if (dragValue) {
            title += "Draggable\n"
        }
        return title;
    }, [deleteAction, dragValue])

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey  && !event.shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (event.ctrlKey && !event.altKey  && !event.shiftKey) {
            if (effect) dispatch(EditValueAction([...path, 0], !effect[0]));
        }
        if (!event.ctrlKey && !event.altKey  && event.shiftKey) {
            if (effectIsChain) {
                dispatch(PushValueAction([...path, 2, 0], null));
                setExpanded(true);
            }
        }
        if (!event.ctrlKey && !event.altKey  && !event.shiftKey) changeExpanded();
    }, [deleteAction, dispatch, effect, setExpanded, changeExpanded]);

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} title={title} onDragOverItem={onDragOverItem}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayEffect effect={effect}/>
        </TreeBlock>
    );
});