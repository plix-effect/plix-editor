import React, {FC, ReactNode, useCallback, useContext, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {JSONEditor} from "./editor/JSONEditor";
import {EditValueAction} from "../PlixEditorReducerActions";
import {TrackContext} from "../TrackContext";

export interface ValueUnknownTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath
}
export const ValueUnknownTrack: FC<ValueUnknownTrackProps> = ({value, children, path}) => {
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        console.log("DISPATCH-EDIT", EditValueAction(path, value));
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    return (
        <Track>
            <TreeBlock>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                <JSONEditor value={value} onChange={onChange} />
            </TimelineBlock>
        </Track>
    );
}