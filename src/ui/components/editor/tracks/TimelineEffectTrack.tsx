import React, {FC, ReactNode, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {
    PlixEffectAliasJsonData,
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {TimelineEditor} from "./editor/timeline/TimelineEditor";

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = ({effect, path, baseExpanded, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    return (
        <Track>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _type">TIMELINE</span>
            </TreeBlock>
            <TimelineBlock>
                <TimelineEditor effect={effect} onChange={() => {}} />
            </TimelineBlock>
        </Track>
    )
}
