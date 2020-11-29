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

export interface TreeBlockFilterProps {
    filter: PlixFilterJsonData,
    clearAction?: MultiActionType,
    deleteAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    expander: ReactNode,
    setExpanded: Dispatch<SetStateAction<boolean>>,
    changeExpanded: () => void,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
}
export const TreeBlockFilter: FC<TreeBlockFilterProps> = memo(({dragValue, setExpanded, filter, path, deleteAction, clearAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const id = filter?.[1];
    const filterIsContainer = id === "FChain" || id === "BlendFilters";
    const filterClass = useFilterClass(filter);

    const title: string|undefined = useMemo(() => {
        if (!deleteAction && !dragValue) return undefined;
        let title = "Ctrl + Click = disable\n"
        if (deleteAction) title += "Alt + Click = delete\n";
        if (filterIsContainer) title += "Shift + Click = add filter\n";
        if (dragValue) {
            title += "Draggable\n"
        }
        return title;
    }, [deleteAction, dragValue])

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (event.ctrlKey && !event.altKey && !event.shiftKey) {
            if (filter) dispatch(EditValueAction([...path, 0], !filter[0]));
        }
        if (!event.ctrlKey && !event.altKey && event.shiftKey) {
            if (filterIsContainer) {
                dispatch(PushValueAction([...path, 2, 0], null));
                setExpanded(true);
            }
        }
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
    }, [deleteAction, dispatch, filter, setExpanded, changeExpanded]);

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

    const rightIcons = (<>
        {filterClass === "container" && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add filter"/>
        )}
        {(deleteAction || clearAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
    </>);

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} title={title} onDragOverItem={onDragOverItem} right={rightIcons}>
            {expander}
            <span className="track-description">{children}</span>
            <span>{" "}</span>
            <DisplayFilter filter={filter}/>
        </TreeBlock>
    );
});