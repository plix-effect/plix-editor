import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext,
    useMemo, useState
} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {useExpander} from "../track-elements/Expander";
import {TrackContext} from "../TrackContext";
import {EditValueAction, MultiActionType} from "../PlixEditorReducerActions";
import {DragType} from "../DragContext";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {PlixProfile} from "@plix-effect/core/types/parser";
import {GroupOverrideEffectsTrack} from "./GroupOverrideEffectsTrack";
import {GroupOverrideFiltersTrack} from "./GroupOverrideFiltersTrack";
import {BSModal} from "../../modal/BSModal";
import {BSModalPart} from "../../modal/BSModalPart";
import {PreviewFieldEditor} from "./editor/preview-field/PreviewFieldEditor";

export interface ProfileTrackProps {
    value: PlixProfile,
    baseValue: PlixProfile,
    name: string,
    children: ReactNode,
    path: EditorPath,
    title?: string,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler],
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
}
export const ProfileTrack: FC<ProfileTrackProps> = memo(({value, baseValue, name, title, children, path, onDragOverItem, deleteAction, clearAction}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(false);
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "profile", value: value},
            deleteAction: deleteAction
        }
    }, [value, deleteAction]);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;
        if (event.shiftKey) return;
        const typedValue = dragData.typedValue;
        if (!typedValue) return;
        if (typedValue.type !== "profile") return;
        const dragOverValue = typedValue.value;
        dragData.dropEffect = "copy";
        return ["_drop-replace", () => void dispatch(EditValueAction(path, dragOverValue))];
    }, [path, dispatch, onDragOverItem]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, shiftKey, altKey}) => {
        if (!ctrlKey && altKey && !shiftKey) {
            if (deleteAction || clearAction) dispatch(deleteAction ?? clearAction);
        }
        if (ctrlKey && altKey && !shiftKey) {
            if (clearAction) dispatch(clearAction);
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [deleteAction, dispatch, path]);

    const onDblClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded();
    }, [changeExpanded]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction) dispatch(deleteAction);
    }, [deleteAction, clearAction, dispatch]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (clearAction) dispatch(clearAction);
    }, [deleteAction, clearAction, dispatch]);

    const paths = useMemo(() => ({
        effects: [...path, "effects"],
        filters: [...path, "filters"],
    }), [path]);

    const clearEffectsAction = useMemo(() => {
        return EditValueAction(paths.effects, {})
    }, [paths]);

    const clearFiltersAction = useMemo(() => {
        return EditValueAction(paths.filters, {})
    }, [paths]);

    const rightIcons = (<>
        {(deleteAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
        {(clearAction) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>)

    return (
        <Track nested expanded={expanded}>
            <TreeBlock selected={selected} onDragOverItem={onDragOverItemSelf} dragValue={dragValue} onClick={onClick} onDoubleClick={onDblClick} right={rightIcons} title={title}>
                {expander}
                <span className="track-description">{children}</span>
                &nbsp;
                <span className="track-description _desc">selected</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <button>select</button>
            </TimelineBlock>

            <GroupOverrideEffectsTrack name={name} effectsMap={value.effects} baseEffectsMap={baseValue.effects} path={paths.effects} clearAction={clearEffectsAction} />
            <GroupOverrideFiltersTrack name={name} filtersMap={value.filters} baseFiltersMap={baseValue.filters} path={paths.filters} clearAction={clearFiltersAction} />

            <Track>
                <TreeBlock>
                    fieldConfig
                </TreeBlock>
                <TimelineBlock fixed>
                    <PreviewFieldEditor/>
                </TimelineBlock>
            </Track>
        </Track>
    );
});