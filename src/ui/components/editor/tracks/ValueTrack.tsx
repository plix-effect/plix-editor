import React, {FC, memo, ReactNode} from "react";
import {EditorPath} from "../../../types/Editor";
import {FilterTrack} from "./FilterTrack";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ArrayTrack} from "./ArrayTrack";
import {EffectTrack} from "./EffectTrack";
import {ColorTrack} from "./ColorTrack";
import {NumberTrack} from "./NumberTrack";

export interface ValueTrackProps {
    value: any,
    type: string,
    children?: ReactNode
    description?: ReactNode
    path: EditorPath
}
export const ValueTrack: FC<ValueTrackProps> = memo(({type, value, description, children, path}) => {
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
    if (type === "color") {
        return (
            <ColorTrack value={value} path={path}>
                {children}
            </ColorTrack>
        );
    }
    if (type === "number") {
        return (
            <NumberTrack value={value} path={path}>
                <span>{children}</span>
            </NumberTrack>
        )
    };
    return <ValueUnknownTrack value={value} path={path} >
        <span>{children}</span>
    </ValueUnknownTrack>
});