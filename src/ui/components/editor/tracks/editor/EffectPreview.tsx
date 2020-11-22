import React, {FC, useContext} from "react";
import "../../track-elements/ColorView.scss";
import {TrackContext} from "../../TrackContext";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {EffectGraphView} from "../../../canvas/EffectGraphView";

export interface EffectPreviewProps {
    effect: PlixEffectJsonData
}
export const EffectPreview: FC<EffectPreviewProps> = ({effect}) => {


    const {track} = useContext(TrackContext);

    return (<>
        <EffectGraphView width={100} height={20} render={effect} track={track} count={20} duration={1000*60*5 + 2257}/>
    </>);
}