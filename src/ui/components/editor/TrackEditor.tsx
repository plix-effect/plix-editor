import React, {
    FC,
    UIEventHandler,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    WheelEvent
} from "react";
import {PortalContext} from "../timeline/PortalContext";
import {TrackContext} from "./TrackContext";
import {EffectTrack} from "./tracks/EffectTrack";
import {GroupEffectsTrack} from "./tracks/GroupEffectsTrack";
import {GroupFiltersTrack} from "./tracks/GroupFiltersTrack";
import {SplitTimeline} from "../divider/SplitTimeline";
import {RedoAction, UndoAction} from "./PlixEditorReducerActions";
import {TrackScale} from "./TrackScale";
import {Track} from "../timeline/Track";
import {ScaleDisplayContext, ScaleDisplayContextProps} from "./ScaleDisplayContext";
import {PlixEditorAction} from "./PlixEditorReducer";


const ZOOM_FACTOR = Math.sqrt(2);
const ZOOM_FACTOR_WHEEL = Math.pow(2, 0.01);

export const TrackEditor: FC = () => {

    const [zoom, setZoom] = useState(0.2);
    const [duration, setDuration] = useState(1000*60*5 + 2257);
    const [position, setPosition] = useState(0.01);
    const [timelineEl, setTimelineEl] = useState<HTMLDivElement>();

    const scaleDisplayContextValue: ScaleDisplayContextProps = useMemo(() => ({
        duration, setDuration,
        zoom, setZoom,
        position, setPosition,
        trackWidth: zoom * duration,
        timelineEl: timelineEl,
    }), [duration, setDuration, zoom, setZoom, position, setPosition, timelineEl]);

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
    }, [track]);

    const mouseLeftRef = useRef(0);
    useEffect(() => {
        const onMouseMove = ({pageX}: DocumentEventMap["mousemove"]) => {
            mouseLeftRef.current = pageX;
        }
        document.addEventListener("mousemove", onMouseMove);
        return () => document.removeEventListener("mousemove", onMouseMove);
    })

    const multiplyZoom = useCallback((value: number) => {
        setZoom(v => {
            let z = v*value;
            if (z > 1) {
                z = 1;
            } else if (duration * z < 500) {
                z = 500/duration;
            }
            if (z === v) return v;
            if (timelineEl) {
                const {left} = timelineEl.getBoundingClientRect();
                const dif = Math.max(mouseLeftRef.current - left, 0);
                timelineEl.scrollLeft = (timelineEl.scrollLeft + dif) * z / v - (dif);
            }
            return z;

        });
    }, [setZoom, duration]);

    const zoomIn = useCallback(() => multiplyZoom(ZOOM_FACTOR), [multiplyZoom])
    const zoomOut = useCallback(() => multiplyZoom(1/ZOOM_FACTOR), [multiplyZoom])

    useEffect(() => {
        const onKeydown = ({ctrlKey, shiftKey, altKey, code}: DocumentEventMap["keydown"]) => {
            const focusedNode = document.querySelectorAll(":focus:not(body)");
            const active = (focusedNode.length <= 0);
            if (active && ctrlKey && !shiftKey && !altKey && code === "KeyZ") return dispatch(UndoAction());
            if (active && ctrlKey && shiftKey && !altKey && code === "KeyZ") return dispatch(RedoAction());
            if (active && ctrlKey && !shiftKey && !altKey && code === "KeyY") return dispatch(RedoAction());
            if (active && !ctrlKey && !shiftKey && !altKey && code === "Minus") return zoomOut();
            if (active && !ctrlKey && !shiftKey && !altKey && code === "Equal") return zoomIn();
        }
        document.addEventListener("keydown", onKeydown);
        return () => document.removeEventListener("keydown", onKeydown);
    }, [dispatch, zoomIn, zoomOut]);

    const onWheel = useCallback((event: WheelEvent<any>) => {
        if (!event.ctrlKey && !event.metaKey) return;
        if (!event.deltaY) return;
        const zoomIndex = Math.pow(ZOOM_FACTOR_WHEEL, event.deltaY);
        multiplyZoom(zoomIndex);
    }, [multiplyZoom]);

    return (
        <ScaleDisplayContext.Provider value={scaleDisplayContextValue}>
            <SplitTimeline minLeft={100} minRight={200} storageKey="timeline" ref={setTimelineEl}>
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
        </ScaleDisplayContext.Provider>
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