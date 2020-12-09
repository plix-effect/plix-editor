import React, {
    ChangeEvent,
    FC,
    memo,
    MouseEvent,
    MouseEventHandler,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {ValueTrack} from "./ValueTrack";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {DEFAULT_PREVIEW_FIELD_CONFIG} from "../../preview/canvas/preview-field/PlixCanvasField";

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

            <ValueTrack path={fieldConfigPath} value={options?.['fieldConfig'] ?? null} type="fieldConfig" title="field config if no profile selected">
                Default field config
                &nbsp;
                {`(${(options?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG).elements.length}px)`}
            </ValueTrack>
        </Track>
    )
});