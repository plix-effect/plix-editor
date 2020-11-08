import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {FilterTrack} from "./FilterTrack";

export interface GroupEffectsTrackProps {
    effectsMap: PlixEffectsMapJsonData,
    pathName: string,
    baseExpanded?: boolean
}
export const GroupEffectsTrack: FC<GroupEffectsTrackProps> = ({effectsMap, pathName}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    const aliasesList = useMemo(() => {
        return Object.keys(effectsMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [pathName, name],
                value: effectsMap[name]
            }
        })
    }, [effectsMap])
    return (
        <Track>
            <div>
                <a onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>
                ===Effects===
            </div>
            <div>pow! you can create effects!</div>
            <TrackAccord expanded={expanded}>
                {aliasesList.map(alias => (
                    <EffectTrack effect={alias.value} path={alias.path} key={alias.name}>
                        {alias.name}
                    </EffectTrack>
                ))}

            </TrackAccord>
        </Track>
    )
}