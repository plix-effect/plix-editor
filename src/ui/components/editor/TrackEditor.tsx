import React, {FC, UIEventHandler, useCallback, useContext, useMemo, useRef, useState, WheelEvent} from "react";
import {PortalContext} from "../timeline/PortalContext";
import {TrackContext} from "./TrackContext";
import {EffectTrack} from "./tracks/EffectTrack";
import {GroupEffectsTrack} from "./tracks/GroupEffectsTrack";
import {GroupFiltersTrack} from "./tracks/GroupFiltersTrack";
import {SplitTimeline} from "../divider/SplitTimeline";
import {RedoAction, UndoAction} from "./PlixEditorReducerActions";
import {TrackScale} from "./TrackScale";
import {Track} from "../timeline/Track";
import {ScaleDisplayContext} from "./ScaleDisplayContext";


const ZOOM_FACTOR = Math.sqrt(2);
const ZOOM_FACTOR_WHEEL = Math.pow(2, 0.01);

export const TrackEditor: FC = () => {
    const [rightRenderEl, setRightRenderEl] = useState<HTMLDivElement>();
    const {track, dispatch, undoCounts, redoCounts} = useContext(TrackContext);
    const paths = useMemo(() => ({
        render: ["render"],
        effects: ["effects"],
        filters: ["filters"],
    }), []);

    const timelineRef = useRef<HTMLDivElement>();

    const undo = useCallback(() => {
        dispatch(UndoAction())
    }, [dispatch])

    const redo = useCallback(() => {
        dispatch(RedoAction())
    }, [dispatch])

    const save = useCallback(() => {
        download('plix-track.json', JSON.stringify(track));
    }, [track])

    const {setZoom, duration} = useContext(ScaleDisplayContext);
    const multiplyZoom = useCallback((value: number) => {
        setZoom(v => {
            let z = v*value;
            if (z > 1) {
                z = 1;
            } else if (duration * z < 500) {
                z = 500/duration;
            }
            if (z === v) return v;
            const timeline = timelineRef.current;
            if (timeline) {
                timeline.scrollLeft = timeline.scrollLeft * z / v;
            }
            return z;

        });
    }, [setZoom, duration]);

    const zoomIn = useCallback(() => multiplyZoom(ZOOM_FACTOR), [multiplyZoom])
    const zoomOut = useCallback(() => multiplyZoom(1/ZOOM_FACTOR), [multiplyZoom])

    const onWheel = useCallback((event: WheelEvent<any>) => {
        if (!event.ctrlKey && !event.metaKey) return;
        if (!event.deltaY) return;
        const zoomIndex = Math.pow(ZOOM_FACTOR_WHEEL, event.deltaY);
        multiplyZoom(zoomIndex);
    }, [multiplyZoom]);

    return (
        <SplitTimeline minLeft={100} minRight={200} storageKey="timeline" ref={timelineRef}>
            <div className="track-header track-header-tree">
                <button onClick={undo} disabled={undoCounts<=0}>undo ({undoCounts})</button>
                <button onClick={redo} disabled={redoCounts<=0}>redo ({redoCounts})</button>
                <button onClick={save}>save</button>
                <button onClick={zoomOut}>(-)</button>
                <button onClick={zoomIn}>(+)</button>
            </div>
            <div className="track-header track-header-timeline" onWheelCapture={onWheel}>
                <TrackScale />
            </div>
            <div className="track-tree" onWheelCapture={onWheel}>
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