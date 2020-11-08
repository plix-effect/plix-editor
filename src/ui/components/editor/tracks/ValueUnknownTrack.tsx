import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

export interface EffectTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath
}
export const ValueUnknownTrack: FC<EffectTrackProps> = ({value, children, path}) => {
    return (
        <Track>
            <TreeBlock>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                {JSON.stringify(value)}
            </TimelineBlock>
        </Track>
    );
}