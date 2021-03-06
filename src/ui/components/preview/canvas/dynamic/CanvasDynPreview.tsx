import * as React from "react";
import {
    ChangeEvent,
    FC,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {isArraysEqual} from "../../../../utils/isArraysEqual";
import {useAudioVolume, usePlaybackControl, usePlaybackData, usePlaybackStatus} from "../../../editor/PlaybackContext";
import type {
    CvsDynPreviewInMsgChangeField,
    CvsDynPreviewInMsgChangePlayback,
    CvsDynPreviewInMsgInit,
    CvsDynPreviewInMsgRenderData, CvsDynPreviewInMsgSyncPerformance,
    CvsDynPreviewOutMsg
} from "./worker/CanvasDynamicPreviewWorker";
import {getParentSelection, useSelectionItem, useSelectionPath} from "../../../editor/SelectionContext";
import {TrackContext} from "../../../editor/TrackContext";
import {ConstructorContext} from "../../../editor/ConstructorContext";
import {TIMELINE_LCM} from "@plix-effect/core";
import "./CanvasDynPreview.scss"
import {CheckboxButton} from "../../../control/checkbox/CheckboxButton";
import {PlaybackRateSelector} from "../PlaybackRateSelector";
import {useLocalStorage} from "../../../../use/useStorage";
import {useProfile, useProfileName} from "../../../editor/ProfileContext";
import {DEFAULT_PREVIEW_FIELD_CONFIG} from "./preview-field/PlixCanvasField";
import {InlineNumberEditor} from "../../../editor/tracks/editor/inline/InlineNumberEditor";

const createDynPreviewCanvasWorker = () => new Worker(new URL("./worker/CanvasDynamicPreviewWorker.ts", import.meta.url));

export interface CanvasDynPreviewProps {
}
export const CanvasDynPreview:FC<CanvasDynPreviewProps> = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [worker, setWorker] = useState<Worker>();
    const [repeatEnabled, setRepeatEnabled] = useLocalStorage("preview-repeat",false);
    const [playbackRate, setPlaybackRate] = useLocalStorage("preview-playback-rate", 1);
    const [rewindSeconds, setRewindSeconds] = useLocalStorage("preview-rewind-seconds", 5);

    const lastUsedSize = useRef<any[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    const playbackStatus = usePlaybackStatus();
    const {playFromStamp, pauseTime, rate} = usePlaybackData()
    const {play, pause, stop, getPlayTime} = usePlaybackControl();

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const {effectConstructorMap, filterConstructorMap} = useContext(ConstructorContext);
    const trackDuration = track?.['editor']?.['duration'] ?? 60*1000;

    const profile = useProfile();
    const [profileName] = useProfileName();
    const profileRef = useRef(profile);
    profileRef.current = profile;

    const {volume, setVolume} = useAudioVolume();
    const percentageVolume = volume*100;
    const setPercentageVolume = (e: ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value)/100);
    }

    const fieldConfig = useMemo(() => {
        return profile?.['fieldConfig'] ?? track?.['editor']?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG;
    }, [profile, track]);

    const [render, start, duration] = useMemo(() => {
        if (selectedType === "effect") {
            if (selectedItem) {
                const copySelectedItem = selectedItem.slice(0);
                copySelectedItem[0] = true;
                return [copySelectedItem, 0, trackDuration]
            }
            else return [selectedItem, 0, trackDuration];
        } else if (selectedType === "record") {
            const copySelectedItem = selectedItem.slice(0);
            copySelectedItem[0] = true; // enable selected track
            const parentSelection = getParentSelection(track, path, effectConstructorMap, filterConstructorMap, 3);
            const timeline = parentSelection.item.slice(0);
            timeline[0] = true; // enable timeline
            timeline[3] = []; // remove timeline filters
            const parentOptions = timeline[2].slice(0);
            parentOptions[0] = [copySelectedItem]; // set only one track
            const bpm = parentOptions[1];
            const offset = parentOptions[3];
            const start = offset + 60000/bpm / TIMELINE_LCM * selectedItem[2];
            const duration = (selectedItem[3]-selectedItem[2]) *  60000/bpm/TIMELINE_LCM
            timeline[2] = parentOptions;
            return [timeline, start, duration]
        }
        return [track.render, 0, trackDuration];
    }, [selectedItem, selectedType, track]);


    useEffect(() => {
        if (!canvas) return;
        const worker = createDynPreviewCanvasWorker();
        setWorker(worker);
        const msg: CvsDynPreviewInMsgInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen(),
            performanceValue: performance.now()
        }

        worker.addEventListener("message", (event) => {
            const data: CvsDynPreviewOutMsg = event.data;
            if (data.type !== "deps") return;
            const [usedEffectNames, usedFilterNames] = data.deps;
            lastUsedEffectNames.current = usedEffectNames;
            lastUsedFilterNames.current = usedFilterNames;
            lastUsedEffects.current = usedEffectNames.map(name => {
                const effect = profileRef.current?.effects?.[name];
                if (effect !== undefined) return effect;
                return track.effects[name];
            });
            lastUsedFilters.current = usedFilterNames.map(name => {
                const filter = profileRef.current?.filters?.[name];
                if (filter !== undefined) return filter;
                return track.filters[name]
            });
        });
        worker.postMessage(msg, [msg.canvas]);

        return () => {
            worker.terminate()
        }
    }, [canvas])

    useEffect(() => {
        if (!worker) return;

        function isRerenderRequired(): boolean{
            if (!isArraysEqual(lastUsedSize.current, [duration, fieldConfig])) {
                return true;
            }
            if (lastUsedEffectRef.current !== render) {
                return true;
            }
            if (!lastUsedEffectNames.current || !lastUsedFilterNames.current) {
                return true;
            }
            const usedEffects = lastUsedEffectNames.current.map(name => {
                const effect = profile?.effects?.[name];
                if (effect !== undefined) return effect;
                return track.effects[name];
            });
            if (!isArraysEqual(lastUsedEffects.current, usedEffects)) {
                return true;
            }
            const usedFilters = lastUsedFilterNames.current.map(name => {
                const filter = profile?.filters?.[name];
                if (filter !== undefined) return filter;
                return track.filters[name];
            });
            return !isArraysEqual(lastUsedFilters.current, usedFilters);

        }
        if (!isRerenderRequired()) return;

        lastUsedSize.current = [duration, fieldConfig];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: CvsDynPreviewInMsgRenderData = {type: "render", data: {render, track, duration, profileName}};

        worker.postMessage(message, []);
    }, [worker, duration, render, track.filters, track.effects, profile, profileName]);

    useEffect(() => {
        if (!worker) return;

        const msg: CvsDynPreviewInMsgChangeField = {
            type: "field",
            config: fieldConfig
        }
        worker.postMessage(msg, [])

    }, [worker, fieldConfig])

    useEffect(() => {
        if (!worker) return;
        const msgSync: CvsDynPreviewInMsgSyncPerformance = {
            type:"sync_performance",
            value: performance.now()
        }
        worker.postMessage(msgSync, [])

        const msg: CvsDynPreviewInMsgChangePlayback = {
            type:"change_playback",
            status: playbackStatus,
            pauseTime: pauseTime,
            rate: rate,
            playFromStamp: playFromStamp,
        }
        worker.postMessage(msg, [])

    }, [playbackStatus, worker, pauseTime, rate, playFromStamp])

    const doPlay = useCallback(() => {
        let playTime = getPlayTime();
        if (playTime == null) playTime = start;
        else if (playTime < start) playTime = start;
        else if (playTime > start+duration) playTime = start;
        play(playTime, playbackRate, repeatEnabled, start, start+duration);
    }, [start, duration, repeatEnabled, playbackRate])

    const onClickPlayBtn = () => {
        if (playbackStatus === "play") {
            pause()
        } else {
            doPlay()
        };
    }

    const onClickStop = () => {
        stop()
    }

    const onClickRewindBack = () => {
        doRewind(-1);
    }
    const onClickRewindForward = () => {
        doRewind(1);
    }

    const doRewind = (dir: (1 | -1)) => {
        const dif = dir*rewindSeconds*1000;
        const getRewTime = (origin: number) => {
            const t = origin+dif;
            if (t < 0) return 0;
            if (t > duration) return duration;
            return t;
        }
        if (playbackStatus === "play") {
            play(getRewTime(getPlayTime()), rate, repeatEnabled, start, start+duration)
        } else if (playbackStatus === "pause") {
            pause(getRewTime(pauseTime));
        }
    }

    const onChangeRepeatCheckbox = useCallback((value) => {
        setRepeatEnabled(value);
        if (playbackStatus === "play") {
            play(null, null, value, start, start+duration)
        }
    }, [playbackStatus, setRepeatEnabled])

    useEffect(() => {
        if (playbackStatus === "play") {
            doPlay();
        }
    }, [doPlay])

    const onChangePlaybackRate = useCallback((rate) => {
        setPlaybackRate(rate);
        if (playbackStatus === "play") {
            play(null, rate, repeatEnabled, start, start+duration)
        }
    }, [playbackStatus, repeatEnabled, setPlaybackRate])

    return (
        <div className={"canvas-preview-container"}>
            <div className={"cvs-container"}>
                <canvas ref={setCanvas} width={1} height={1}/>
            </div>
            <div className={"controls"}>
                <div className={"controls-row"}>
                    <div className={"btn-group-toggle btn-group"}>
                        <button className={"btn btn-md btn-primary"} onClick={onClickPlayBtn} title={playbackStatus === "play" ? "Pause" : "Stop"}>
                            {
                                playbackStatus === "play" ?
                                    (<i className="fas fa-pause"/>)
                                    :
                                    (<i className="fas fa-play"/>)
                            }
                        </button>
                        <button className={"btn btn-md btn-primary"} onClick={onClickStop} title={"Stop"}>
                            <i className="fas fa-stop"/>
                        </button>
                        <CheckboxButton value={repeatEnabled} onChange={onChangeRepeatCheckbox} title={"Repeat"} sizeClass={"btn-md"}>
                            <i className="fas fa-sync-alt"/>
                        </CheckboxButton>
                    </div>
                    <form className={"volume-controls"}>
                        <div className="form-group">
                            <label htmlFor="formControlRange">Music volume</label>
                            <input type="range" className="form-control-range" value={percentageVolume} onChange={setPercentageVolume} min={0} max={100} step={0.5} />
                        </div>
                    </form>
                    <div className={"rewind-controls"}>
                        <div className={"label-line"}>
                            <span>Rewind (seconds): </span>
                            <div className={"rewind-input-container"}>
                                <InlineNumberEditor value={rewindSeconds} onChange={setRewindSeconds}/>
                            </div>
                        </div>
                        <div className={"btn-group"}>
                            <button className={"btn btn-md btn-primary"} onClick={onClickRewindBack} title={"Rewind back"}>
                                <i className="fas fa-backward"/>
                            </button>
                            <button className={"btn btn-md btn-primary"} onClick={onClickRewindForward} title={"Rewind forward"}>
                                <i className="fas fa-backward" style={{transform: "rotate(180deg)"}}/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={"rate-option"}>
                    <span>Playback rate: </span>
                    <div className={"rate-selector"}>
                        <PlaybackRateSelector value={playbackRate} onChange={onChangePlaybackRate}/>
                    </div>
                </div>
            </div>
        </div>
    )
}