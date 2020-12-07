import React, {ReactNode, useMemo, memo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import "./tracks.scss"
import {ArrayElementsTrack} from "./ArrayElementsTrack";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {EffectParamsTrack} from "./EffectParamsTrack";
import {RenameTrack} from "./RenameTrack";

export interface ContainerEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    alias?: string,
    expanded: boolean,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    leftBlock?: ReactNode,
}
export const ContainerEffectTrack = memo<ContainerEffectTrackProps>(({leftBlock, alias, effect, path, expanded, onChange}) => {
    const params = effect[2];
    const paramEffects = useMemo(() => params[0] || [], [params]);
    const paramEffectsPath = useMemo(() => [...path, 2, 0], [path]);

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineEffectTypeEditor onChange={onChange} effect={effect} />
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"effect"}/>)}

            <ArrayElementsTrack value={paramEffects} type="effect" path={paramEffectsPath} canDelete/>

            <EffectParamsTrack effect={effect} path={path} skipParams={1}/>
        </Track>
    )
})
