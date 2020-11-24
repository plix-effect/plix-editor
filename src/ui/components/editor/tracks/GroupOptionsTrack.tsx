import React, {ChangeEvent, FC, memo, MouseEvent, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {ValueTrack} from "./ValueTrack";

export interface GroupOptionsTrackProps {
    options: object,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupOptionsTrack: FC<GroupOptionsTrackProps> = memo(({options = {}, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);

    const durationPath = useMemo(() => [...path, "duration"] ,[path])
    const countPath = useMemo(() => [...path, "count"] ,[path])

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="description">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Options===</span>
            </TreeBlock>
            <TimelineBlock type="description" fixed>
                options
            </TimelineBlock>

            <ValueTrack path={durationPath} value={options?.['duration'] ?? null} type="number" description="duration in milliseconds">
                Track duration
            </ValueTrack>

            <ValueTrack path={countPath} value={options?.['count'] ?? null} type="number" description="number of pixels">
                Pixels
            </ValueTrack>
        </Track>
    )
});

const defaultFilter = null;