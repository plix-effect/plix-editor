import React, {
    ChangeEvent,
    DragEventHandler,
    FC,
    memo,
    useCallback,
    useContext,
    useMemo,
    KeyboardEvent,
    useState, MouseEventHandler, FormEventHandler, DragEvent, useRef, useEffect, ReactNode
} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectsMapJsonData, PlixEffectJsonData, PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction, MultiActionType} from "../PlixEditorReducerActions";
import "./GroupEffectsTrack.scss";
import {DragType} from "../DragContext";
import {DisplayEffect} from "./editor/DisplayEffect";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {FilterTrack} from "./FilterTrack";

export interface GroupOverrideFiltersTrackProps {
    name: string,
    filtersMap: PlixFiltersMapJsonData,
    baseFiltersMap: PlixFiltersMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    clearAction?: MultiActionType,
}
export const GroupOverrideFiltersTrack: FC<GroupOverrideFiltersTrackProps> = memo(({name, filtersMap, baseFiltersMap, path, baseExpanded, clearAction}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const aliasesList = useMemo(() => {
        return Object.keys(baseFiltersMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: filtersMap[name],
                overrideValue: baseFiltersMap[name],
            }
        })
    }, [filtersMap, baseFiltersMap]);

    const count = useMemo(() => Object.keys(filtersMap || {}).length, [filtersMap]);
    const totalCount = useMemo(() => Object.keys(baseFiltersMap || {}).length, [baseFiltersMap]);

    const clearFilters = useCallback(() => {
        if (clearAction) dispatch(clearAction);
    }, [clearAction])

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey,altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) clearFilters();
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [dispatch]);

    const onDblClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
        event.preventDefault();
    }, [changeExpanded]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        clearFilters();
    }, [clearFilters]);

    const rightIcons = (<>
        {(count > 0 && clearAction) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>)

    return (
        <Track nested expanded={expanded}>
            <TreeBlock selected={selected} onClick={onClickTree} onDoubleClick={onDblClickTree} right={rightIcons}>
                {expander}
                <span className="track-description">Filters ({count}/{totalCount})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">{name}: overriding effects</span>
            </TimelineBlock>
            {aliasesList.map(({value, path, name, overrideValue}) => (
                <OverrideFilterTrack path={path} value={value} name={name} key={name} overrideValue={overrideValue} />
            ))}
        </Track>
    );
});

interface OverrideFilterTrackProps {
    value: PlixFilterJsonData,
    overrideValue: PlixFilterJsonData,
    path: EditorPath,
    name: string,
}
const OverrideFilterTrack: FC<OverrideFilterTrackProps> = memo(({value, path, name, overrideValue}) => {
    const deleteAction = useMemo(() => DeleteAction(path), [path]);

    return (
        <FilterTrack filter={value} path={path} key={name} alias={name} deleteAction={deleteAction} overrideValue={overrideValue}>
            {name}
        </FilterTrack>
    );
});