import React, {FC, memo, ReactNode, useCallback, useContext} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {EditValueAction} from "../PlixEditorReducerActions";
import {TrackContext} from "../TrackContext";
import {InlineJsonEditor} from "./editor/inline/InlineJsonEditor";
import {InlineNumberEditor} from "./editor/inline/InlineNumberEditor";

export interface ValueUnknownTrackProps {
    value: any,
    children: ReactNode
    path: EditorPath
}
export const NumberTrack: FC<ValueUnknownTrackProps> = memo(({value, children, path}) => {
    const {dispatch} = useContext(TrackContext);
    const onChange = useCallback((value) => {
        dispatch(EditValueAction(path, value));
    }, [dispatch, path]);

    return (
        <Track>
            <TreeBlock>
                {children}
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineNumberEditor value={value} onChange={onChange} />
            </TimelineBlock>
        </Track>
    );
});