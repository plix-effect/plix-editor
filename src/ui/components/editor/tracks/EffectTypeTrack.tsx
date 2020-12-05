import React, {FC, memo} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import "./tracks.scss"
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {TimelineBlinkPreview} from "./editor/TimelineBlinkPreview";

export interface EffectTypeTrackProps {
    effect: PlixEffectJsonData,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
export const EffectTypeTrack: FC<EffectTypeTrackProps> = memo(({effect, onChange}) => {
    return (
        <Track>
            <TreeBlock>
                Effect type
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineEffectTypeEditor onChange={onChange} effect={effect} />
            </TimelineBlock>
        </Track>
    );
})