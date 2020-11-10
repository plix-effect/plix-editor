import React, {FC, ReactNode, useCallback, useContext} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {parseColor} from "@plix-effect/core";
import {ColorView} from "../track-elements/ColorView";
import {ColorEditor} from "./editor/ColorEditor";
import {TrackContext} from "../TrackContext";
import {EditValueAction} from "../PlixEditorReducerActions";

export interface ColorTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath
}
export const ColorTrack: FC<ColorTrackProps> = ({value, children, path}) => {
    const color = parseColor(value, null);
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, []);

    return (
        <Track>
            <TreeBlock>
                {children} <ColorView background={true} color={color}/>
            </TreeBlock>
            <TimelineBlock fixed>
                <ColorEditor color={value} onChange={onChange}/>
            </TimelineBlock>
        </Track>
    );
}