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
import { PlixEffectsMapJsonData, PlixEffectJsonData} from "@plix-effect/core/types/parser";
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

export interface GroupOverrideEffectsTrackProps {
    name: string,
    effectsMap: PlixEffectsMapJsonData,
    baseEffectsMap: PlixEffectsMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    clearAction?: MultiActionType,
}
export const GroupOverrideEffectsTrack: FC<GroupOverrideEffectsTrackProps> = memo(({name, effectsMap, baseEffectsMap, path, baseExpanded, clearAction}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const aliasesList = useMemo(() => {
        return Object.keys(baseEffectsMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: effectsMap[name],
                overrideValue: baseEffectsMap[name],
            }
        })
    }, [effectsMap, baseEffectsMap]);

    const count = useMemo(() => Object.keys(effectsMap || {}).length, [effectsMap]);
    const totalCount = useMemo(() => Object.keys(baseEffectsMap || {}).length, [baseEffectsMap]);

    const clearEffects = useCallback(() => {
        if (clearAction) dispatch(clearAction);
    }, [clearAction])

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey,altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) clearEffects();
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
        clearEffects();
    }, [clearEffects]);

    const rightIcons = (<>
        {(count > 0 && clearAction) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>)

    return (
        <Track nested expanded={expanded}>
            <TreeBlock selected={selected} onClick={onClickTree} onDoubleClick={onDblClickTree} right={rightIcons}>
                {expander}
                &nbsp;
                <i className="fas fa-palette"/>
                &nbsp;
                <span className="track-description">Effects ({count}/{totalCount})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">{name}: overriding effects</span>
            </TimelineBlock>
            {aliasesList.map(({value, path, name, overrideValue}) => (
                <OverrideEffectTrack path={path} value={value} name={name} key={name} overrideValue={overrideValue} />
            ))}
        </Track>
    );
});

interface OverrideEffectTrackProps {
    value: PlixEffectJsonData,
    overrideValue: PlixEffectJsonData,
    path: EditorPath,
    name: string,
}
const OverrideEffectTrack: FC<OverrideEffectTrackProps> = memo(({value, path, name, overrideValue}) => {
    const deleteAction = useMemo(() => DeleteAction(path), [path]);

    return (
        <EffectTrack effect={value} path={path} key={name} alias={name} deleteAction={deleteAction} overrideValue={overrideValue}>
            {name}
        </EffectTrack>
    );
});