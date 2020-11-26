import React, {DragEventHandler, FC, memo, MouseEventHandler, ReactNode, useCallback, useContext, useMemo, DragEvent} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {EditValueAction, MultiActionType} from "../../PlixEditorReducerActions";
import {TreeBlock} from "../../track-elements/TreeBlock";
import {DragType} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {EditorPath} from "../../../../types/Editor";
import {DisplayEffect} from "./DisplayEffect";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";
import {DisplayFilter} from "./DisplayFilter";

export interface TreeBlockFilterProps {
    filter: PlixFilterJsonData,
    deleteAction?: MultiActionType,
    dragValue?: DragType,
    path: EditorPath,
    expander: ReactNode,
    changeExpanded: () => void,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const TreeBlockFilter: FC<TreeBlockFilterProps> = memo(({dragValue, filter, path, deleteAction, expander, changeExpanded, children, onDragOverItem}) => {
    const {dispatch} = useContext(TrackContext);

    const title: string|undefined = useMemo(() => {
        if (!deleteAction && !dragValue) return undefined;
        let title = ""
        if (deleteAction) title += "Alt + Click = delete\n";
        if (dragValue) {
            title += "Draggable"
        }
        return title;
    }, [deleteAction, dragValue])

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (event.altKey && deleteAction) dispatch(deleteAction);
    }, [deleteAction, dispatch])

    return (
        <TreeBlock dragValue={dragValue} onClick={onClick} title={title} onDragOverItem={onDragOverItem}>
            {expander}
            <span className="track-description" onClick={changeExpanded}>{children}</span>
            <span>{" "}</span>
            <DisplayFilter filter={filter} path={path}/>
        </TreeBlock>
    );
});