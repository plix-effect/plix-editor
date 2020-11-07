import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ValueUnknownTrack} from "./ValueUnknownTrack";

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    path: EditorPath
}
export const ValueTrack: FC<ValueTrackProps> = ({type, value, children, path}) => {
    if (type === "filter") {
        return (
            <FilterTrack filter={value} path={path}>
                {children}
            </FilterTrack>
        )
    }
    return <ValueUnknownTrack value={value} path={path} >
        <span>{children}</span>
    </ValueUnknownTrack>
}