import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import {PortalContext} from "../timeline/PortalContext";
import {TrackContext} from "./TrackContext";
import {EffectTrack} from "./tracks/EffectTrack";
import {GroupEffectsTrack} from "./tracks/GroupEffectsTrack";
import {GroupFiltersTrack} from "./tracks/GroupFiltersTrack";
import {SplitTimeline} from "../divider/SplitTimeline";
import {RedoAction, UndoAction} from "./PlixEditorReducerActions";
import {TrackScale} from "./TrackScale";
import {Track} from "../timeline/Track";


export const TrackEditor: FC = () => {
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

    const save = useCallback(() => {
        download('plix-track.json', JSON.stringify(track));
    }, [track])

    return (
        <SplitTimeline minLeft={100} minRight={200} storageKey="timeline">
            <div className="track-header track-header-tree">
                <button onClick={undo} disabled={undoCounts<=0}>undo ({undoCounts})</button>
                <button onClick={redo} disabled={redoCounts<=0}>redo ({redoCounts})</button>
                <button onClick={save}>save</button>
            </div>
            <div className="track-header track-header-timeline">
                <TrackScale />
            </div>
            <div className="track-tree">
                <PortalContext.Provider value={rightRenderEl}>
                    <Track>
                        {null /*left*/}
                        {null /*right*/}
                        <EffectTrack effect={track.render} baseExpanded={true} path={paths.render}>render</EffectTrack>
                        <GroupEffectsTrack effectsMap={track.effects} path={paths.effects}/>
                        <GroupFiltersTrack filtersMap={track.filters} path={paths.filters}/>
                    </Track>
                </PortalContext.Provider>
            </div>
            <div className="track-timeline" ref={setRightRenderEl} />
        </SplitTimeline>
    );
}

function download(filename, text) {
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}