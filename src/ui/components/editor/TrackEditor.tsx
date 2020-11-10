import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import {PortalsContext, PortalsContextProps} from "../timeline/PortalsContext";
import {TrackContext} from "./TrackContext";
import {EffectTrack} from "./tracks/EffectTrack";
import {GroupEffectsTrack} from "./tracks/GroupEffectsTrack";
import {GroupFiltersTrack} from "./tracks/GroupFiltersTrack";
import {SplitTimeline} from "../divider/SplitTimeline";
import {RedoAction, UndoAction} from "./PlixEditorReducerActions";



export const TrackEditor: FC = () => {
    const [leftRenderEl, setLeftRenderEl] = useState<HTMLDivElement>();
    const [rightRenderEl, setRightRenderEl] = useState<HTMLDivElement>();
    const {track, dispatch, undoCounts, redoCounts} = useContext(TrackContext);
    const paths = useMemo(() => ({
        render: ["render"],
        effects: ["effects"],
        filters: ["filters"],
    }), []);

    const undo = useCallback(() => {
        dispatch(UndoAction())
    }, [dispatch])

    const redo = useCallback(() => {
        dispatch(RedoAction())
    }, [dispatch])

    const renderCtxValue: PortalsContextProps = {leftElement: leftRenderEl, rightElement: rightRenderEl}

    return (<>
        <SplitTimeline minLeft={100} minRight={200} storageKey="timeline">
            <div className="track-header track-header-tree">
                <button onClick={undo} disabled={undoCounts<=0}>undo ({undoCounts})</button>
                <button onClick={redo} disabled={redoCounts<=0}>redo ({redoCounts})</button>
            </div>
            <div className="track-header track-header-timeline">(RIGHT_HEADER_RIGHT_HEADER_RIGHT_HEADER)</div>
            <div className="track-tree"  ref={setLeftRenderEl} />
            <div className="track-timeline"  ref={setRightRenderEl} />
        </SplitTimeline>
        <PortalsContext.Provider value={renderCtxValue}>
            {/*<GroupRenderTrack render={track.render} path={paths.render}/>*/}
            <EffectTrack effect={track.render} baseExpanded={true} path={paths.render}>render</EffectTrack>
            <GroupEffectsTrack effectsMap={track.effects} path={paths.effects}/>
            <GroupFiltersTrack filtersMap={track.filters} path={paths.filters}/>
        </PortalsContext.Provider>
    </>)
}