import React, {FC, ReactNode, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ValueTrack} from "./ValueTrack";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {getArrayKey} from "../../../utils/KeyManager";
import {useExpander} from "../track-elements/Expander";
import {TrackContext} from "../TrackContext";
import {PushValueAction} from "../PlixEditorReducerActions";

export interface ArrayTrackProps {
    value: any[],
    type: string,
    children: [name: ReactNode,desc: ReactNode]
    path: EditorPath
}
export const ArrayTrack: FC<ArrayTrackProps> = ({value, type, children: [name, desc], path}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);
    const valuesData = useMemo(() => {
        return value.map((val, i) => {
            const key = getArrayKey(value, i);
            const valPath: EditorPath = [...path, {key: String(key), array: value}]
            return {
                path: valPath,
                key: key,
                value: val,
                index: i,
            }
        })
    }, [value]);

    const valueToPush = useMemo(() => {
        if (type.startsWith("array:")) return [];
        return defaultValuesMap[type];
    }, [type]);

    const {dispatch} = useContext(TrackContext);
    const push = useCallback(() => {
        dispatch(PushValueAction(path, valueToPush));
    }, [valueToPush])

    return (
        <Track>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{name}</span>
                {" "}
                <span className="track-description _desc">({value.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                {desc} { valueToPush !== undefined && <a onClick={push}>[add {type}]</a> }
            </TimelineBlock>
            <TrackAccord expanded={expanded}>
                {valuesData.map(({key, value, path, index}) => {
                    return (
                        <ValueTrack key={key} type={type} value={value} path={path}>
                            [{index}]
                        </ValueTrack>
                    )
                })}
            </TrackAccord>
        </Track>
    );
}

const defaultValuesMap = {
    color: [0,0,0,0],
    blender: "normal",
    effect: null,
    filter: null,
    gradient: [[0, [0,0,0,1]], [1, [0,0,1,0]]],
    number: 0,
    position: [[0,1], [2,3]],
    timing: ["linear", 1, 0],
}