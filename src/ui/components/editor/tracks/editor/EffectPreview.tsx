import React, {ChangeEvent, FC, useCallback, useContext, useMemo} from "react";
import "../../track-elements/ColorView.scss";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {EffectGraphView} from "../../../canvas/EffectGraphView";

export interface EffectPreviewProps {
    effect: PlixEffectJsonData
}
export const EffectPreview: FC<EffectPreviewProps> = ({effect}) => {


    const {track} = useContext(TrackContext);

    return (<>
        <EffectGraphView width={100} height={20} effect={effect} track={track}/>
    </>);
}