import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectsMapJsonData, PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {FilterTrack} from "./FilterTrack";
import {ExpandButton} from "../track-elements/ExpandButton";
import {TreeBlock} from "../track-elements/TreeBlock";

export interface GroupFiltersTrackProps {
    filtersMap: PlixFiltersMapJsonData,
    pathName: string,
    baseExpanded?: boolean
}
export const GroupFiltersTrack: FC<GroupFiltersTrackProps> = ({filtersMap, pathName}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    const aliasesList = useMemo(() => {
        return Object.keys(filtersMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [pathName, name],
                value: filtersMap[name]
            }
        })
    }, [filtersMap])
    return (
        <Track>
            <div>
                <ExpandButton onClick={changeExpanded} expanded={expanded}/>
                ===Filters===
            </div>
            <div>yay! you can create filters!</div>
            <TrackAccord expanded={expanded}>
                {aliasesList.map(effectAlias => (
                    <FilterTrack filter={effectAlias.value} path={effectAlias.path}>
                        {effectAlias.name}
                    </FilterTrack>
                ))}

            </TrackAccord>
        </Track>
    )
}