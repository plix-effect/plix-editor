import React, {FC, memo, ReactNode, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TimelineEditor} from "./editor/TimelineEditor";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {ValueTrack} from "./ValueTrack";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import "./tracks.scss"

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    children: ReactNode,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    changeExpanded: () => void,
    expanded: boolean,
    expander: ReactNode;
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = memo(({effect, effect: [enabled, effectId, params, filters], path, children, onChange, changeExpanded, expanded, expander}) => {

    const filtersPath = useMemo(() => [...path, 3], [path]);
    const timelinePath = useMemo(() => [...path, 2, 0], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    const {effectConstructorMap} = useContext(TrackContext);
    const timelineConstructorMeta = useMemo<ParseMeta>(() => effectConstructorMap['Timeline']['meta'], [effectConstructorMap]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="timeline">
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _type">{timelineConstructorMeta.name}</span>
            </TreeBlock>
            <TimelineBlock type="timeline">
                <TimelineEditor cycle={params[1]} grid={params[2]} offset={params[3]} records={params[0]} path={timelinePath} />
            </TimelineBlock>

            <EffectTypeTrack onChange={onChange} effect={effect} />

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Cycle
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <span className="track-description">
                        {params[1] || "no cycle"} todo: change cycle
                    </span>
                </TimelineBlock>
            </Track>

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Grid
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <span className="track-description">
                        {params[2] || "no grid"} todo: change grid
                    </span>
                </TimelineBlock>
            </Track>

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Offset
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <span className="track-description">
                        {params[3] || 0} todo: change offset
                    </span>
                </TimelineBlock>
            </Track>


            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect">
                Filters
            </ValueTrack>
        </Track>
    )
})
