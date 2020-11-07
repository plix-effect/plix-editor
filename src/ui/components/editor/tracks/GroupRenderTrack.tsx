import React, {FC, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {TrackAccord} from "../../timeline/TrackAccord";

export interface GroupRenderTrackProps {
    render: PlixEffectJsonData,
    pathName: string,
    baseExpanded?: boolean,
}
export const GroupRenderTrack: FC<GroupRenderTrackProps> = ({render, pathName, baseExpanded}) => {
    const path = useMemo(() => [pathName], [pathName]);
    return (
        <Track>
            <div>[v] ===Render===</div>
            <div>this is a main effect</div>
            <TrackAccord expanded={true}>
                <EffectTrack effect={render} path={path} baseExpanded={baseExpanded}>
                    render
                </EffectTrack>
            </TrackAccord>
        </Track>
    )
}