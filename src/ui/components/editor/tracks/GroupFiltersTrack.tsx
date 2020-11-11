import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectsMapJsonData, PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {FilterTrack} from "./FilterTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

export interface GroupFiltersTrackProps {
    filtersMap: PlixFiltersMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupFiltersTrack: FC<GroupFiltersTrackProps> = ({filtersMap, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(true);
    const aliasesList = useMemo(() => {
        return Object.keys(filtersMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: filtersMap[name]
            }
        })
    }, [filtersMap]);
    return (
        <Track>
            <TreeBlock type="description">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Filters===</span>
            </TreeBlock>
            <TimelineBlock type="description" fixed>
                you can create filters
            </TimelineBlock>
            <TrackAccord expanded={expanded}>
                {aliasesList.map(alias => (
                    <FilterTrack filter={alias.value} path={alias.path} key={alias.name}>
                        {alias.name}
                    </FilterTrack>
                ))}

            </TrackAccord>
        </Track>
    )
}