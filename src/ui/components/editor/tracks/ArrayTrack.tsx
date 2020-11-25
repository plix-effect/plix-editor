import React, {FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {useExpander} from "../track-elements/Expander";
import {TrackContext} from "../TrackContext";
import {PushValueAction} from "../PlixEditorReducerActions";
import {ArrayElementsTrack} from "./ArrayElementsTrack";

export interface ArrayTrackProps {
    value: any[],
    type: string,
    children: [name: ReactNode,desc: ReactNode]
    path: EditorPath
}
export const ArrayTrack: FC<ArrayTrackProps> = memo(({value, type, children: [name, desc], path}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);
    const {dispatch} = useContext(TrackContext);

    const valueToPush = useMemo(() => {
        if (type.startsWith("array:")) return [];
        return defaultValuesMap[type];
    }, [type]);

    const push = useCallback(() => {
        dispatch(PushValueAction(path, valueToPush));
    }, [valueToPush])

    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{name}</span>
                <span>{" "}</span>
                <span className="track-description _desc">({value.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                { valueToPush !== undefined && (<a onClick={push}>[add {type}]</a>)}
                &nbsp;
                <span className="track-description _desc">{desc}</span>
            </TimelineBlock>
            <ArrayElementsTrack value={value} type={type} path={path} canDelete/>
        </Track>
    );
})

const defaultValuesMap = {
    color: 0xFF00FF80,
    blender: "normal",
    effect: null,
    filter: null,
    gradient: [[0, [0,0,0,1]], [1, [0,0,1,0]]],
    number: 0,
    position: [[0,1], [2,3]],
    timing: ["linear", 1, 0],
}