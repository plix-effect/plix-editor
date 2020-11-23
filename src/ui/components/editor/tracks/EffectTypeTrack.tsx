import React, {FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
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
import {TimelineEffectTrack} from "./TimelineEffectTrack";
import {ChainEffectTrack} from "./ChainEffectTrack";
import {EffectTypeEditor} from "./editor/EffectTypeEditor";
import {EditValueAction} from "../PlixEditorReducerActions";
import {InlineEditor} from "./editor/inline/InlineEditor";

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
                <InlineEditor type={"effectType"} onChange={onChange} value={effect} />
            </TimelineBlock>
        </Track>
    )
})