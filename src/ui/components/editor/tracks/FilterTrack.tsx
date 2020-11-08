import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData, PlixFilterJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ArrayTrack} from "./ArrayTrack";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

export interface FilterTrackProps {
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode
}
export const FilterTrack: FC<FilterTrackProps> = ({filter, path, children}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    return (
        <Track>
            <TreeBlock>
                <a href="javascript:void.0" onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                <FilterName filter={filter} /> some description of filter
            </TimelineBlock>
            <TrackAccord expanded={expanded}>
            </TrackAccord>
        </Track>
    );
}

const FilterName: FC<{filter: PlixFilterJsonData}> = ({filter}) => {
    if (!filter) return <>---</>
    if (filter[1]) {
        return <>{filter[1]}</>
    }
    return <>alias:{filter[2]}</>
}

const FilterDesc: FC<{filter: PlixFilterJsonData}> = ({filter}) => {
    if (!filter) return <>---</>
    if (filter[1]) {
        return <>{filter[1]}</>
    }
    return <>alias:{filter[2]}</>
}