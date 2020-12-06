import * as React from "react";
import {ChangeEventHandler, FC, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";
import {isArraysEqual} from "../../../utils/isArraysEqual";
import {usePlaybackControl, usePlaybackData, usePlaybackStatus} from "../../editor/PlaybackContext";
import type {FieldConfig} from "./worker/PlixCanvasField";
import type {
    CvsDynPreviewInMsgChangeField,
    CvsDynPreviewInMsgChangePlayback,
    CvsDynPreviewInMsgInit,
    CvsDynPreviewInMsgRenderData, CvsDynPreviewInMsgSyncPerformance,
    CvsDynPreviewOutMsg
} from "./worker/CanvasDynamicPreviewWorker";
import {getParentSelection, useSelectionItem, useSelectionPath} from "../../editor/SelectionContext";
import {TrackContext} from "../../editor/TrackContext";
import {ConstructorContext} from "../../editor/ConstructorContext";
import {TIMELINE_LCM} from "@plix-effect/core/dist/effects/Timeline";

const createDynPreviewCanvasWorker = () => new Worker(new URL("./worker/CanvasDynamicPreviewWorker.ts", import.meta.url));

export interface CanvasDynPreviewProps {
    fieldConfig: FieldConfig
}
export const CanvasDynPreview:FC<CanvasDynPreviewProps> = ({fieldConfig}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [worker, setWorker] = useState<Worker>();
    const checkboxRef = useRef<HTMLInputElement>()

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

    const [render, start, duration] = useMemo(() => {
        if (selectedType === "effect") {
            if (selectedItem) {
                const copySelectedItem = selectedItem.slice(0);
                copySelectedItem[0] = true;
                if (selectedItem[1] === "Timeline") return [copySelectedItem, 0, trackDuration]
                return [copySelectedItem, 0, 3000]
            }
            else return [selectedItem, 0, 3000];
        } else if (selectedType === "record") {
            const copySelectedItem = selectedItem.slice(0);
            copySelectedItem[0] = true;
            const parentSelection = getParentSelection(track, path, effectConstructorMap, filterConstructorMap, 3);
            const timeline = parentSelection.item.slice(0);
            timeline[0] = true;
            const parentOptions = timeline[2].slice(0);
            parentOptions[0] = [copySelectedItem];
            const bpm = parentOptions[1];
            const offset = parentOptions[3];
            const start = offset + 60000/bpm / TIMELINE_LCM * selectedItem[2];
            const duration = (selectedItem[3]-selectedItem[2]) *  60000/bpm/TIMELINE_LCM
            timeline[2] = parentOptions;
            console.log("PARENT",timeline);
            return [timeline, start, duration]
        }
        return [track.render, 0, trackDuration];
    }, [selectedItem, selectedType, track])

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
            lastUsedEffects.current = usedEffectNames.map(name => track.effects[name]);
            lastUsedFilters.current = usedFilterNames.map(name => track.filters[name]);
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
            const usedEffects = lastUsedEffectNames.current.map(name => track.effects[name]);
            if (!isArraysEqual(lastUsedEffects.current, usedEffects)) {
                return true;
            }
            const usedFilters = lastUsedFilterNames.current.map(name => track.filters[name]);
            return !isArraysEqual(lastUsedFilters.current, usedFilters);

        }
        if (!isRerenderRequired()) return;

        lastUsedSize.current = [duration, fieldConfig];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: CvsDynPreviewInMsgRenderData = {type: "render", data: {render, track, duration}};

        worker.postMessage(message, []);
    }, [worker, duration, render, track.filters, track.effects]);

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

    const onClickPlay = useCallback(() => {
        const repeat = checkboxRef.current ? checkboxRef.current.checked : false;
        let playTime = getPlayTime();
        console.log("GETPLAYTIME", playTime);
        if (playTime == null) playTime = start;
        else if (playTime < start) playTime = start;
        else if (playTime > start+duration) playTime = start;
        play(playTime, 1, repeat, start, start+duration);
        console.log("PLAY", playTime, 1, repeat, start, start+duration)
    }, [start, duration])

    const onClickPause = () => {
        pause();
    }

    const onClickStop = () => {
        stop()
    }

    const onChangeRepeatCheckbox: ChangeEventHandler<HTMLInputElement> = (event) => {
        const checked = event.target.checked;
        if (playbackStatus === "play") {
            play(null, null, checked, start, start+duration)
        }
    }

    useEffect(() => {
        if (playbackStatus === "play") {
            onClickPlay();
        }
    }, [onClickPlay])

    return (
        <div>
            <canvas ref={setCanvas}/>
            <button onClick={onClickPlay}>PLAY</button>
            <button onClick={onClickPause}>PAUSE</button>
            <button onClick={onClickStop}>STOP</button>
            <input type={"checkbox"} ref={checkboxRef} onChange={onChangeRepeatCheckbox}/>
        </div>
    )
}