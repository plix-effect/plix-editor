import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";

export interface EffectTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath
}
export const ValueUnknownTrack: FC<EffectTrackProps> = ({value, children, path}) => {
    return (
        <Track>
            <div title={path.join(" > ")}>
                {children}
            </div>
            <div>{JSON.stringify(value)}</div>
        </Track>
    );
}