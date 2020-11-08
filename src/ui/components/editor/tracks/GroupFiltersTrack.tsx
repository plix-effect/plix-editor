import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectsMapJsonData, PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {FilterTrack} from "./FilterTrack";

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
                <a onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>
                ===Filters===
            </div>
            <div>yay! you can create filters!</div>
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