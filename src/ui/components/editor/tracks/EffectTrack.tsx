import React, {FC, ReactNode, useCallback, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ArrayTrack} from "./ArrayTrack";

export interface EffectTrackProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const EffectTrack: FC<EffectTrackProps> = ({effect, path, baseExpanded, children}) => {
    const [expanded, setExpanded] = useState(baseExpanded || false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    return (
        <Track>
            <div title={path.join(" > ")}>
                <a href="javascript:void.0" onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>
                {children}
            </div>
            <div>
                <EffectName effect={effect} />: some description of effect
            </div>
            <TrackAccord expanded={expanded}>
                <ArrayTrack path={[...path, 3]} value={effect[3] || []} type="filter">
                    <span>Filters</span>
                    <span>list of filters</span>
                </ArrayTrack>
            </TrackAccord>
        </Track>
    );
}

const EffectName: FC<{effect: PlixEffectJsonData}> = ({effect}) => {
    if (!effect) return <>---</>
    if (effect[1]) {
        return <>{effect[1]}</>
    }
    return <>alias:{effect[2]}</>
}

const EffectDesc: FC<{effect: PlixEffectJsonData}> = ({effect}) => {
    if (!effect) return <>---</>
    if (effect[1]) {
        return <>{effect[1]}</>
    }
    return <>alias:{effect[2]}</>
}