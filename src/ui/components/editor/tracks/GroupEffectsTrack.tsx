import React, {FC, useCallback, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";
import {FilterTrack} from "./FilterTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

export interface GroupEffectsTrackProps {
    effectsMap: PlixEffectsMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupEffectsTrack: FC<GroupEffectsTrackProps> = ({effectsMap, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(true);
    const aliasesList = useMemo(() => {
        return Object.keys(effectsMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: effectsMap[name]
            }
        })
    }, [effectsMap])
    return (
        <Track>
            <TreeBlock type="description">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Effects===</span>
            </TreeBlock>
            <TimelineBlock type="description" fixed>
                pow! you can create effects!
            </TimelineBlock>
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