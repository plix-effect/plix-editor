import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {ExpandButton} from "../track-elements/ExpandButton";
import {TreeBlock} from "../track-elements/TreeBlock";

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
                <ExpandButton onClick={changeExpanded} expanded={expanded}/>
                ===Aliases===
            </div>
            <div>pow! you can create aliases!</div>
            <TrackAccord expanded={expanded}>
                {aliasesList.map(effectAlias => (
                    <EffectTrack effect={effectAlias.value} path={effectAlias.path}>
                        {effectAlias.name}
                    </EffectTrack>
                ))}

            </TrackAccord>
        </Track>
    )
}