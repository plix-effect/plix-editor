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
import cn from "classnames";

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

    const {toggleSelect, isSelectedPath} = useSelectionControl();
    const selectionPath = useSelectionPath();

    const effectClass = useEffectClass(effect);

    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) { // Alt
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (ctrlKey && altKey && !shiftKey) { // Ctrl+Alt
            if (clearAction) dispatch(clearAction);
        }
        if (!ctrlKey && altKey && shiftKey) { // Shift+Alt
            if (effectClass === "timeline" || effectClass === "container") {
                dispatch(EditValueAction([...path, 2, 0], []));
            }
        }
        if (ctrlKey && !altKey  && !shiftKey) {
            if (effect) dispatch(EditValueAction([...path, 0], !effect[0]));
        }
        if (!ctrlKey && !altKey && shiftKey) { // Shift
            if (effectClass === "container") {
                dispatch(PushValueAction([...path, 2, 0], null));
                setExpanded(true);
            }
        }
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded(); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, effect, setExpanded, changeExpanded]);

    const onClickAdd: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (effectClass === "container") {
            dispatch(PushValueAction([...path, 2, 0], null));
            setExpanded(true);
        }
    }, [effectClass, dispatch]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
    }, [deleteAction, clearAction, dispatch]);

    const onClickEye: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (effect) dispatch(EditValueAction([...path, 0], !effect[0]));
    }, [dispatch, effect]);

    const rightIcons = (<>
        {(effect) && (
            <i
                className={cn("far track-tree-icon track-tree-icon-action", effect[0] ? "fa-eye" : "fa-eye-slash")}
                onClick={onClickEye}
                title={effect[0] ? "hide" : "show"}
            />
        )}
        {effectClass === "container" && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add effect"/>
        )}
        {(deleteAction || clearAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
    </>)

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} onDragOverItem={onDragOverItem} selected={selected} right={rightIcons}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayEffect effect={effect}/>
        </TreeBlock>
    );
});