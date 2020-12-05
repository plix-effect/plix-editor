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
import {EditValueAction, MultiActionType, PushValueAction} from "../../PlixEditorReducerActions";
import {TreeBlock} from "../../track-elements/TreeBlock";
import {DragType} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {EditorPath} from "../../../../types/Editor";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";
import {DisplayFilter} from "./DisplayFilter";
import {useFilterClass} from "../../../../use/useFilterClass";
import cn from "classnames";
import {useSelectionControl, useSelectionPath} from "../../SelectionContext";

export interface TreeBlockFilterProps {
    filter: PlixFilterJsonData,
    clearAction?: MultiActionType,
    deleteAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    expander: ReactNode,
    setExpanded: Dispatch<SetStateAction<boolean>>,
    changeExpanded: () => void,
    title?: string,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const TreeBlockFilter: FC<TreeBlockFilterProps> = memo(({dragValue, setExpanded, title, filter, path, deleteAction, clearAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const id = filter?.[1];
    const filterIsContainer = id === "FChain" || id === "BlendFilters";
    const filterClass = useFilterClass(filter);
    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (ctrlKey && !altKey && !shiftKey) {
            if (filter) dispatch(EditValueAction([...path, 0], !filter[0]));
        }
        if (!ctrlKey && !altKey && shiftKey) {
            if (filterIsContainer) {
                dispatch(PushValueAction([...path, 2, 0], null));
                setExpanded(true);
            }
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, filter, setExpanded, changeExpanded]);

    const onDblClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded();
    }, [changeExpanded]);

    const onClickAdd: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (filterClass === "container") {
            dispatch(PushValueAction([...path, 2, 0], null));
            setExpanded(true);
        }
    }, [filterClass, dispatch]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
    }, [deleteAction, clearAction, dispatch]);

    const onClickEye: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (filter) dispatch(EditValueAction([...path, 0], !filter[0]));
    }, [dispatch, filter]);

    const rightIcons = (<>
        {(filter) && (
            <i
                className={cn("far track-tree-icon track-tree-icon-action", filter[0] ? "fa-eye" : "fa-eye-slash")}
                onClick={onClickEye}
                title={filter[0] ? "hide" : "show"}
            />
        )}
        {filterClass === "container" && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add filter"/>
        )}
        {(deleteAction || clearAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
    </>);

    return (
        <TreeBlock dragValue={dragValue} selected={selected} onClick={onClick} onDoubleClick={onDblClick} title={title} onDragOverItem={onDragOverItem} right={rightIcons}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayFilter filter={filter}/>
        </TreeBlock>
    );
});