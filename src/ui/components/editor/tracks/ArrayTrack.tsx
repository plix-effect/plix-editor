import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ValueUnknownTrack} from "./ValueUnknownTrack";
import {ValueTrack} from "./ValueTrack";

export interface ArrayTrackProps {
    value: any[],
    type: string,
    children: [name: ReactNode,desc: ReactNode]
    path: EditorPath
}
export const ArrayTrack: FC<ArrayTrackProps> = ({value, type, children: [name, desc], path}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded])
    return (
        <Track>
            <div title={path.join(" > ")}>
                <a href="javascript:void.0" onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>
                {name} ({value.length})
            </div>
            {desc}
            <TrackAccord expanded={expanded}>
                {value.map((val, index) => (
                    <ValueTrack type={type} value={val} path={[...path, index]}>
                        [{index}]
                    </ValueTrack>
                ))}
            </TrackAccord>
        </Track>
    );
}