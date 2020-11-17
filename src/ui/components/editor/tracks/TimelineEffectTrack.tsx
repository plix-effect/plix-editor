import React, {FC, memo, ReactNode} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {TimelineEditor} from "./editor/timeline/TimelineEditor";

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = memo(({effect, path, baseExpanded, children}) => {
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
})
