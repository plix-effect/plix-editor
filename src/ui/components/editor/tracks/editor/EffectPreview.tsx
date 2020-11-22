import React, {FC, useContext} from "react";
import "../../track-elements/ColorView.scss";
import {TrackContext} from "../../TrackContext";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {EffectGraphView} from "../../../canvas/EffectGraphView";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";

export interface EffectPreviewProps {
    effect: PlixEffectJsonData
}
export const EffectPreview: FC<EffectPreviewProps> = ({effect}) => {

    const {duration, pixelsCount} = useContext(ScaleDisplayContext);

    const {track} = useContext(TrackContext);

    return (<>
        <EffectGraphView width={100} height={20} render={effect} track={track} count={pixelsCount} duration={duration}/>
    </>);
}