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
    overrideValue: PlixEffectJsonData,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    setExpanded: Dispatch<SetStateAction<boolean>>,
    expander: ReactNode,
    changeExpanded: () => void,
    title?: string,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const TreeBlockEffect: FC<TreeBlockEffectProps> = memo(({dragValue, overrideValue, effect, title, path, deleteAction, setExpanded, clearAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
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
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, effect, setExpanded, select, toggleSelect, path]);

    const onDblClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded();
    }, [changeExpanded]);

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

    const onClickOverride: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (effect === undefined && overrideValue !== undefined) dispatch(EditValueAction(path, overrideValue));
    }, [dispatch, effect, overrideValue]);

    const rightIcons = (<>
        {(effect) && (
            <i
                className={cn("far track-tree-icon track-tree-icon-action", effect[0] ? "fa-eye" : "fa-eye-slash")}
                onClick={onClickEye}
                title={effect[0] ? "hide" : "show"}
            />
        )}
        {effect !== undefined && effectClass === "container" && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add effect"/>
        )}
        {effect !== undefined && (deleteAction || clearAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
        {effect === undefined && overrideValue !== undefined && (
            <i className="far fa-clone track-tree-icon track-tree-icon-action" onClick={onClickOverride} title="override"/>
        )}
    </>)

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} onDoubleClick={onDblClick} onDragOverItem={onDragOverItem} selected={selected} right={rightIcons} title={title}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayEffect effect={effect === undefined ? overrideValue : effect} override={effect === undefined && overrideValue !== undefined}/>
        </TreeBlock>
    );
});