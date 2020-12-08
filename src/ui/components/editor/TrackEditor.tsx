import React, {
    FC,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
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
import {GroupOptionsTrack} from "./tracks/GroupOptionsTrack";
import {TrackPlayPosition} from "./tracks/editor/TrackPlayPosition";
import {AudioFileContext} from "./AudioFileContext";
import {setMp3Json} from "../../utils/Mp3Meta";
import {GroupProfilesTrack} from "./tracks/GroupProfilesTrack";


const ZOOM_FACTOR = Math.sqrt(2);
const ZOOM_FACTOR_WHEEL = Math.pow(2, 0.01);

export const TrackEditor: FC = () => {

    const {audioFile, setAudioFile} = useContext(AudioFileContext);
    const {track, dispatch, undoCounts, redoCounts} = useContext(TrackContext);
    const [zoom, setZoom] = useState(0.2);
    const [position, setPosition] = useState(0.01);
    const [timelineEl, setTimelineEl] = useState<HTMLDivElement>();

    const duration = track?.['editor']?.['duration'] ?? 60*1000;
    const pixelsCount = track?.['editor']?.['count'] ?? 20;


    const scaleDisplayContextValue: ScaleDisplayContextProps = useMemo(() => ({
        duration,
        pixelsCount,
        zoom, setZoom,
        position, setPosition,
        trackWidth: zoom * duration,
        timelineEl: timelineEl,
    }), [duration, zoom, setZoom, position, setPosition, timelineEl, pixelsCount]);

    const [rightRenderEl, setRightRenderEl] = useState<HTMLDivElement>();
    const paths = useMemo(() => ({
        render: ["render"],
        effects: ["effects"],
        filters: ["filters"],
        editor: ["editor"],
        profiles: ["profiles"],
    }), []);

    const undo = useCallback(() => {
        dispatch(UndoAction())
    }, [dispatch])

    const redo = useCallback(() => {
        dispatch(RedoAction())
    }, [dispatch])

    const save = useCallback(async () => {
        if (audioFile) {
            const buffer = await audioFile.arrayBuffer()
            const settledBuffer = await setMp3Json(buffer, track);
            saveByteArray(settledBuffer, audioFile.name);
            return;
        }
        download('plix-track.json', JSON.stringify(track));
    }, [track, audioFile]);

    const mouseLeftRef = useRef(0);
    useEffect(() => {
        const onMouseMove = ({pageX}: DocumentEventMap["mousemove"]) => {
            mouseLeftRef.current = pageX;
        }
        document.addEventListener("mousemove", onMouseMove);
        return () => document.removeEventListener("mousemove", onMouseMove);
    })

    useEffect(() => {
        const onKeydown = ({ctrlKey, shiftKey, altKey, code}: DocumentEventMap["keydown"]) => {
            const focusedNode = document.querySelectorAll(":focus:not(body)");
            const active = (focusedNode.length <= 0);
            if (active && ctrlKey && !shiftKey && !altKey && code === "KeyZ") return dispatch(UndoAction());
            if (active && ctrlKey && shiftKey && !altKey && code === "KeyZ") return dispatch(RedoAction());
            if (active && ctrlKey && !shiftKey && !altKey && code === "KeyY") return dispatch(RedoAction());
        }
        document.addEventListener("keydown", onKeydown);
        return () => document.removeEventListener("keydown", onKeydown);
    }, [dispatch]);

    const deleteFile = useCallback(() => {
        setAudioFile(null);
    }, [setAudioFile]);

    return (
        <ScaleDisplayContext.Provider value={scaleDisplayContextValue}>
            <SplitTimeline minLeft={100} minRight={200} storageKey="timeline" ref={setTimelineEl}>
                <div className="track-header track-header-tree">
                    <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={undo} disabled={undoCounts<=0} title={"Undo"}>
                        <i className="fa fa-undo"/>
                        <span className="badge badge-secondary">{undoCounts}</span>
                    </button>
                    <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={redo} disabled={redoCounts<=0} title={"Redo"}>
                        <i className="fa fa-redo"/>
                        <span className="badge badge-secondary">{redoCounts}</span>
                    </button>
                    <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={save} title={"Save"}>
                        <i className="fa fa-save"/>
                    </button>
                    <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={deleteFile} title={"Delete audio"}>
                        <i className="far fa-trash-alt"/>
                    </button>
                    <div className="track-header-filename">
                        {audioFile !== null ? (
                            audioFile.name
                        ) : (
                            "no audio file"
                        )}
                    </div>
                </div>
                <div className="track-header track-header-timeline">
                    <TrackScale />
                </div>
                <div className="track-tree">
                    <PortalContext.Provider value={rightRenderEl}>
                        <Track>
                            {null /*left*/}
                            {null /*right*/}
                            <EffectTrack effect={track.render} baseExpanded={true} path={paths.render} title="main render effect">render</EffectTrack>
                            <GroupEffectsTrack effectsMap={track.effects} path={paths.effects}/>
                            <GroupFiltersTrack filtersMap={track.filters} path={paths.filters}/>
                            <GroupProfilesTrack profilesMap={track.profiles} path={paths.profiles} baseValue={track}/>
                            <GroupOptionsTrack options={track?.['editor']} path={paths.editor}/>
                        </Track>
                    </PortalContext.Provider>
                </div>
                <div className="track-timeline" style={{minWidth: scaleDisplayContextValue.trackWidth}} ref={setRightRenderEl}>
                    <TrackPlayPosition />
                </div>
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

const saveByteArray: (data: ArrayBuffer, name: string) => void = (function () {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    return function (data, name) {
        const blob = new Blob([data], {type: "octet/stream"});
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());