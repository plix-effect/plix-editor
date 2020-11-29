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

export interface GroupOptionsTrackProps {
    options: object,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupOptionsTrack: FC<GroupOptionsTrackProps> = memo(({options = {}, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);

    const durationPath = useMemo(() => [...path, "duration"] ,[path]);
    const countPath = useMemo(() => [...path, "count"] ,[path]);

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
    }, [changeExpanded]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title" onClick={onClickTree}>
                {expander}
                <span className="track-description" onClick={changeExpanded}>Options</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed>
                <span className="track-description _desc">track options</span>
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