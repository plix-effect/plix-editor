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
import {useSelectionControl, useSelectionPath} from "../../SelectionContext";
import {useEffectClass} from "../../../../use/useEffectClass";

export interface TreeBlockEffectProps {
    effect: PlixEffectJsonData,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    setExpanded: Dispatch<SetStateAction<boolean>>,
    expander: ReactNode,
    changeExpanded: () => void,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const TreeBlockEffect: FC<TreeBlockEffectProps> = memo(({dragValue, effect, path, deleteAction, setExpanded, clearAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const effectIsChain = effect && effect[1] === "Chain";
    const {toggleSelect, isSelectedPath} = useSelectionControl();
    const selectionPath = useSelectionPath();

    const effectClass = useEffectClass(effect);

    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath])

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
        if (!event.ctrlKey && event.altKey && !event.shiftKey) { // Alt
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (event.ctrlKey && event.altKey && !event.shiftKey) { // Ctrl+Alt
            if (clearAction) dispatch(clearAction);
        }
        if (!event.ctrlKey && event.altKey && event.shiftKey) { // Shift+Alt
            if (effectClass === "timeline" || effectClass === "container") {
                dispatch(EditValueAction([...path, 2, 0], []));
            }
        }
        if (!event.ctrlKey && !event.altKey && event.shiftKey) { // Shift
            if (effectIsChain) {
                dispatch(PushValueAction([...path, 2, 0], null));
                setExpanded(true);
            }
        }
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded(); // Click
        if (event.ctrlKey && !event.altKey && event.shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, effect, setExpanded, changeExpanded]);

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} title={title} onDragOverItem={onDragOverItem} selected={selected}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayEffect effect={effect}/>
        </TreeBlock>
    );
});