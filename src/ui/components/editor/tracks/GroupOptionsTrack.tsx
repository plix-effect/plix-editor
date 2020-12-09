import React, {FC, memo, MouseEventHandler, useCallback, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {ValueTrack} from "./ValueTrack";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {EditValueAction} from "../PlixEditorReducerActions";

export interface GroupOptionsTrackProps {
    options: object,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupOptionsTrack: FC<GroupOptionsTrackProps> = memo(({options = {}, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);

    const durationPath = useMemo(() => [...path, "duration"] ,[path]);
    const fieldConfigPath = useMemo(() => [...path, "fieldConfig"] ,[path]);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [toggleSelect, select, path]);

    const onDblClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
        event.preventDefault();
    }, [changeExpanded]);

    const clearFieldConfigAction = useMemo(() => {
        return EditValueAction(fieldConfigPath, undefined)
    }, [fieldConfigPath]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock selected={selected} type="title" onClick={onClickTree} onDoubleClick={onDblClickTree}>
                {expander}
                &nbsp;
                <i className="fas fa-sliders-h"/>
                &nbsp;
                <span className="track-description" onClick={changeExpanded}>Options</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed>
                <span className="track-description _desc">track options</span>
            </TimelineBlock>

            <ValueTrack path={durationPath} value={options?.['duration'] ?? null} type="number" title="duration in milliseconds">
                Track duration
            </ValueTrack>

            <ValueTrack path={fieldConfigPath} value={options?.['fieldConfig'] ?? null} type="fieldConfig" title="field config if no profile selected" clearAction={clearFieldConfigAction}>
                Default field config
                &nbsp;
                {options?.['fieldConfig'] ? `(${options?.['fieldConfig'].elements.length}px)` : '(default)'}
            </ValueTrack>
        </Track>
    )
});