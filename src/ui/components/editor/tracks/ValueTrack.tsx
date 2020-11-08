import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ArrayTrack} from "./ArrayTrack";
import {EffectTrack} from "./EffectTrack";

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    description?: ReactNode
    path: EditorPath
}
export const ValueTrack: FC<ValueTrackProps> = ({type, value, description, children, path}) => {
    if (type.startsWith("array:")) {
        return (
            <ArrayTrack path={path} value={value} type={type.substring(6)}>
                {children}
                <span className="track-description _desc">{description}</span>
            </ArrayTrack>
        )
    }
    if (type === "filter") {
        return (
            <FilterTrack filter={value} path={path}>
                {children}
            </FilterTrack>
        )
    }
    if (type === "effect") {
        return (
            <EffectTrack effect={value} path={path}>
                {children}
            </EffectTrack>
        );
    }
    return <ValueUnknownTrack value={value} path={path} >
        <span>{children}</span>
    </ValueUnknownTrack>
}